const express = require("express");
const app = express();
const server = require("http").createServer(app);
const PORT = 3001;
const WebSocket = require("ws");
const WEB_URL = `https://bjarko21.onrender.com`;

const wss = new WebSocket.Server({ server: server });

app.use(express.static("public/"));

server.listen(PORT, () =>
  console.log(`Listening on  3001`)
);


const clients = {};
const games = {};
const players = {};
const spectators = {};

let dealer = null;
let gameOn = null;

wss.on("connection", (ws) => {
  ws.on("open", () => console.log("opened"));
  ws.on("close", () => {
    console.log("closed");
  });

  ws.on("message", (message) => {
    const result = JSON.parse(message);

    if (result.method === "create") {
      const clientId = result.clientId;
      const playerSlot = result.playerSlot;
      const offline = result.offline;
      const roomId = partyId();
      const gameId = WEB_URL + roomId;

      app.get("/" + roomId, (req, res) => {
        res.sendFile(__dirname + "/public/index.html");
      });

      // .route.path
      games[gameId] = {
        id: gameId,
        clients: [],
        players: [],
        dealer: dealer,
        gameOn: gameOn,
        player: player,
        spectators: [],
        playerSlot: playerSlot,
        playerSlotHTML: [
          {},
          {},
          {},
          {},
        ],
      };

      const payLoad = {
        method: "create",
        game: games[gameId],
        roomId: roomId,
        offline: offline,
      };

      const con = clients[clientId].ws;
      con.send(JSON.stringify(payLoad));
    }

 
    if (result.method === "join") {
      const nickname = result.nickname;
      const avatar = result.avatar;
      const gameId = result.gameId;
      const roomId = result.roomId;
      let theClient = result.theClient;
      const clientId = result.clientId;
      const game = games[gameId];
      let players = game.players;
      const spectators = game.spectators;
      const playerSlot = game.playerSlot;
      const playerSlotHTML = game.playerSlotHTML;

      theClient.nickname = nickname;
      theClient.avatar = avatar;

      if (game.spectators.length >= 4) {
        return;
      }

      theClient.clientId = clientId;
      game.spectators.push(theClient);

      for (let i = 0; i < game.spectators.length; i++) {
        if (game.spectators[i].clientId === clientId) {
          game.spectators[i] = theClient;
        }
      }

      const payLoad = {
        method: "join",
        game: game,
        players: players,
        spectators: spectators,
        playerSlotHTML: playerSlotHTML,
        roomId: roomId,
      };

      if (!game.gameOn === true) {
        game.spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }

      

      const payLoadClient = {
        method: "joinClient",
        theClient: theClient,
        game: game,
      };
      if (!game.gameOn === true) {
        clients[clientId].ws.send(JSON.stringify(payLoadClient));
      }

      const newPlayer = theClient;
      const payLoadClientArray = {
        method: "updateClientArray",
        players: players,
        newPlayer: newPlayer,
        spectators: spectators,
        playerSlot: playerSlot,
        playerSlotHTML: playerSlotHTML,
      };

      if (!game.gameOn === true) {
        game.spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoadClientArray));
        });
      }

      const payLoadMidGame = {
        method: "joinMidGame",
        theClient: theClient,
        game: game,
      };

      if (game.gameOn === true) {
        clients[clientId].ws.send(JSON.stringify(payLoadMidGame));
      }

      const payLoadMidGameUpdate = {
        method: "joinMidGameUpdate",
        spectators: spectators,
        newPlayer: newPlayer,
      };
      if (game.gameOn === true) {
        game.spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoadMidGameUpdate));
        });
      }
    }

    // bets logic
    if (result.method === "bet") {
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "bet",
        players: players,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "deck") {
      const spectators = result.spectators;
      const deck = result.deck;
      const clientDeal = result.clientDeal;
      const gameOn = result.gameOn;

      const payLoad = {
        method: "deck",
        deck: deck,
        gameOn: gameOn,
        clientDeal: clientDeal,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "isReady") {
      const theClient = result.theClient;
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "isReady",
        players: players,
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "hasLeft") {
      const theClient = result.theClient;
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "hasLeft",
        players: players,
        spectators: spectators,
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "currentPlayer") {
      const players = result.players;
      const player = result.player;
      const dealersTurn = result.dealersTurn;
      const spectators = result.spectators;

      const payLoad = {
        method: "currentPlayer",
        player: player,
      };

      if (dealersTurn === false) {
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }

      if (dealersTurn === true) {
        players.pop(players.slice(-1)[0]);
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }
    }

    if (result.method === "update") {
      const players = result.players;
      const dealer = result.dealer;
      const deck = result.deck;
      const spectators = result.spectators;
      const gameOn = result.gameOn;

      const payLoad = {
        method: "update",
        players: players,
        dealer: dealer,
        deck: deck,
        gameOn: gameOn,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "chatMessage") {
      const clientId = result.clientId;
      const gameId = result.gameId;
      const message = result.text;
      const game = games[gameId];
      if (!game) return;
      let sender = result.sender;  
      const chatPayload = {
        method: "chatMessage",
        sender: sender,
        text: message,
      };
      
      
      // Broadcast message to all spectators and players in the game
      game.spectators.forEach((spectator) => {
        console.log("This is sender: "+chatPayload.sender);
        clients[spectator.clientId].ws.send(JSON.stringify(chatPayload));
      });
 
      if (game.players) {
        game.players.forEach((player) => {
          console.log("This is sender: "+chatPayload.sender);
          clients[player.clientId].ws.send(JSON.stringify(chatPayload));
        });
      }
    }

    if (result.method === "thePlay") {
      const gameId = result.gameId;
      const game = games[gameId];
      const player = result.player;
      const dealersTurn = result.dealersTurn;
      const currentPlayer = result.currentPlayer;

      const payLoad = {
        method: "thePlay",
        player: player,
        currentPlayer: currentPlayer,
        players: player,
      };

      if (dealersTurn === false) {
        game.players.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }
    }

    if (result.method === "showSum") {
      const players = result.players;
      const spectators = result.spectators;

      const payLoad = {
        method: "showSum",
        players: players,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "joinTable") {
      let theClient = result.theClient;
      const user = result.theClient;
      const theSlot = result.theSlot;
      const gameId = result.gameId;
      const game = games[gameId];
      const spectators = result.spectators;
      const players = result.players;
      const playerSlotHTML = result.playerSlotHTML;

      players.push(theClient);
      playerSlotHTML[theSlot] = clientId;

      for (let i = 0; i < players.length; i++) {
        if (players[i].clientId === clientId) {
          players[i] = theClient;
        }
      }

      game.players = players;
      game.playerSlotHTML = playerSlotHTML;

      const payLoad = {
        method: "joinTable",
        theSlot: theSlot,
        user: user,
        game: game,
        players: players,
        spectators: spectators,
        playerSlotHTML: playerSlotHTML,
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "updatePlayerCards") {
      const resetCards = result.resetCards;
      const players = result.players;
      const player = result.player;
      const spectators = result.spectators;

      const payLoad = {
        method: "updatePlayerCards",
        players: players,
        player: player,
        resetCards: resetCards,
      };
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "updateDealerCards") {
      const players = result.players;
      const spectators = result.spectators;
      const player = result.player;
      const dealer = result.dealer;
      const dealersTurn = result.dealersTurn;
      const payLoad = {
        method: "updateDealerCards",
        player: player,
        dealer: dealer,
        players: players,
        dealersTurn: dealersTurn,
      };
      if (dealersTurn === false) {
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }

      if (dealersTurn === true) {
        players.pop(players.slice(-1)[0]);
        spectators.forEach((c) => {
          clients[c.clientId].ws.send(JSON.stringify(payLoad));
        });
      }
    }

    if (result.method === "dealersTurn") {
      const dealersTurn = result.dealersTurn;
      const spectators = result.spectators;
      const payLoad = {
        method: "dealersTurn",
        dealersTurn: dealersTurn,
      };
      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "terminate") {
      let gameId = result.gameId;
      let game = games[gameId];
      let spectators = result.spectators;
      let players = result.players;
      const theClient = result.theClient;
      let playerSlotHTML = result.playerSlotHTML;
      const reload = result.reload;
      const gameOn = result.gameOn;

      const oldPlayerIndex = spectators.findIndex(
        (spectators) => spectators.clientId === theClient.clientId
      );

      if (game === undefined) {
        game = {
          spectators: {},
          players: {},
          playerSlotHTML: {},
        };
      }

      let playerSlotIndex = null;

      for (let i = 0; i < players.length; i++) {
        for (let s = 0; s < spectators.length; s++) {
          if (players[i].hasLeft === true) {
            if (spectators[s].clientId === players[i].clientId) {
              spectators[s].hasLeft = true;
            }
          }
        }
      }

      for (let i = 0; i < playerSlotHTML.length; i++) {
        if (clientId === playerSlotHTML[i]) {
          playerSlotIndex = i;
        }
      }

      if (spectators.length === 1 && players.some((e) => e.hiddenCard)) {
        players.splice(-1)[0];
      }

      if (gameOn === false || spectators.length === 1) {

        if (reload === true) {
          for (let i = 0; i < spectators.length; i++) {
            if (clientId === spectators[i].clientId) {
              spectators.splice(i, 1);
            }
          }
        }

        for (let i = 0; i < playerSlotHTML.length; i++) {
          if (clientId === playerSlotHTML[i]) {
            playerSlotHTML[i] = {};
          }
        }
        for (let i = 0; i < players.length; i++) {
          if (clientId === players[i].clientId) {
            players.splice(i, 1);
          }
        }
      }

      game.spectators = spectators;
      game.players = players;
      game.playerSlotHTML = playerSlotHTML;

      const payLoad = {
        method: "leave",
        playerSlotIndex: playerSlotIndex,
        players: players,
        playerSlotHTML: playerSlotHTML,
        spectators: spectators,
        oldPlayerIndex: oldPlayerIndex,
        game: game,
        gameOn: gameOn,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "playersLength") {
      const gameId = result.gameId;
      const game = games[gameId];
      const playersLength = game.spectators.length;

      const payLoadLength = {
        method: "playersLength",
        playersLength: playersLength,
      };

      ws.send(JSON.stringify(payLoadLength));
    }

    if (result.method === "resetRound") {
      const spectators = result.spectators;
      const theClient = result.theClient;

      const payLoad = {
        method: "resetRound",
        theClient: theClient,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "playerResult") {
      const spectators = result.spectators;
      const players = result.players;

      const payLoad = {
        method: "playerResult",
        players: players,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "playerResultNatural") {
      const spectators = result.spectators;
      const players = result.players;
      const playerNaturalIndex = result.playerNaturalIndex;

      const payLoad = {
        method: "playerResultNatural",
        players: players,
        playerNaturalIndex: playerNaturalIndex,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "finalCompare") {
      const spectators = result.spectators;
      const gameId = result.gameId;
      const game = games[gameId];
      const players = result.players;
      game.players = players;

      const payLoad = {
        method: "finalCompare",
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "resetGameState") {
      const spectators = result.spectators;
      const gameId = result.gameId;
      const game = games[gameId];
      const players = result.players;
      game.players = players;

      const payLoad = {
        method: "resetGameState",
        game: game,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "wsDealCards") {
      dealCards();
    }

    if (result.method === "getRoute") {
      const getRouteId = result.getRouteId;
      let isRouteDefined = null;

      for (let i = 3; i < app._router.stack.length; i++) {
        if (app._router.stack[i].route.path === "/" + getRouteId) {
          isRouteDefined = true;
        } else {
          isRouteDefined = false;
        }
      }
      const payLoadRoute = {
        method: "redirect",
        isRouteDefined: isRouteDefined,
      };

      if (isRouteDefined === false) {
        ws.send(JSON.stringify(payLoadRoute));
      }
    }

    if (result.method === "dealersHiddenCard") {
      const spectators = result.spectators;
      const dealersHiddenCard = result.dealersHiddenCard;

      const payLoad = {
        method: "dealersHiddenCard",
        dealersHiddenCard: dealersHiddenCard,
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "startTimer") {
      const spectators = result.spectators;

      const payLoad = {
        method: "startTimer",
      };

      spectators.forEach((c) => {
        clients[c.clientId].ws.send(JSON.stringify(payLoad));
      });
    }

    if (result.method === "syncGame") {
      const gameId = result.gameId;
      let game = games[gameId];
      const gameOn = result.gameOn;
      const dealer = result.dealer;
      const players = result.players;
      const player = result.player;
      const spectators = result.spectators;
      const playerSlotHTML = result.playerSlotHTML;

      if (game === undefined) {
        game = {};
      }
      game.gameOn = gameOn;
      game.dealer = dealer;
      game.players = players;
      game.player = player;
      game.spectators = spectators;
      game.playerSlotHTML = playerSlotHTML;
    }
  });
  const clientId = guid();
  clients[clientId] = {
    ws: ws,
  };

  let theClient = {
    nickname: "",
    avatar: "",
    cards: [],
    bet: 0,
    balance: 5000,
    sum: null,
    hasAce: false,
    isReady: false,
    blackjack: false,
    hasLeft: false,
  };
  let player = null;
  players[theClient] = {
    ws: ws,
  };
  players[player] = {
    ws: ws,
  };
  spectators[theClient] = {
    ws: ws,
  };

  const payLoad = {
    method: "connect",
    clientId: clientId,
    theClient: theClient,
  };

  ws.send(JSON.stringify(payLoad));
});

const guid = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
};

function partyId() {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get("/offline", (req, res) => {
  res.sendFile(__dirname + "/public/offline.html");
});

app.get("/credits", (req, res) => {
  res.sendFile(__dirname + "/public/credits.html");
});

app.get("/:id", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("*", function (req, res) {
  res.redirect("/");
});
