// form remove karnar
if (window.location.href.length === window.origin.length + 1) {
  $("#btnJoin").removeClass("noclick-nohide");
  $("#btnCreate").removeClass("noclick-nohide");
  $("#btnOffline").removeClass("noclick-nohide");
}

// HTML elements
let clientId = null;
let gameId = null;
let roomId = null;
let theClient = null;
let storedPlayers = [];
let fixCurrentPlayerLength = 0;
players = [];
spectators = [];
playerSlotHTML = [];
let clicked = null;
let doubleDown = null;
let reload = null;
let cardIndex = null;
let cardIndexJoin = 0;
let playerNaturalIndex = null;
let dealersHiddenCard = "";
let timerStarted = false;
let newPlayer = null;
let offline = null;

let HOST = location.origin.replace(/^http/, "ws");
let ws = new WebSocket(HOST);

const btnCreate = document.getElementById("btnCreate");
const btnOffline = document.getElementById("btnOffline");
const btnJoin = document.getElementById("btnJoin");
const txtGameId = document.getElementById("txtGameId");
const divPlayers = document.getElementById("divPlayers");
const divBoard = document.getElementById("divBoard");
const multiPlayerSpans = document.getElementsByClassName("canhide");


let nickname = document.querySelector("#nickname");
let playersLength = null;
let theSlot = null;
let z = null; // last player table index
let aPlayer = null;
let joined = false;
let playerSlot = document.querySelectorAll(".players");
let playerCards = document.querySelectorAll(".player-cards");
let dealerCards = document.querySelectorAll(".dealer-cards");
let dealerSlot = document.querySelector("#dealer");
let playerName = document.querySelectorAll(".player-name");
let resetCards = false;
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const sendButton = document.getElementById('sendButton');


ws.addEventListener("open", () => {
  console.log("Lets go !!!");
});

window.addEventListener("load", function () {
  setTimeout(function () {
    $("#btnJoin").removeClass("noclick-nohide");
    $("#btnCreate").removeClass("noclick-nohide");
    $("#btnOffline").removeClass("noclick-nohide");

    btnJoin.addEventListener("click", (e) => {
      $("#loading-screen").removeClass("hide-element");
      document.getElementById("chatIcon").classList.remove("hide-element");
      const payLoadLength = {
        method: "playersLength",
        gameId: gameId
      };

      ws.send(JSON.stringify(payLoadLength));

      setTimeout(function () {
        if (playersLength >= 7) {
          $("#loading-screen").addClass("hide-element");
          alert("Game Is full!");
          return;
        } else {
          playerJoin();
          setTimeout(function () {
            $("#loading-screen").addClass("hide-element");
            $("#main-menu").addClass("hide-element");
            $("#game-room").removeClass("hide-element");
          }, 250);
          
        }
      }, 50);
    });

    btnCreate.addEventListener("click", (e) => {
      $("#loading-screen").removeClass("hide-element");
      document.getElementById("chatIcon").classList.remove("hide-element");
      const payLoad = {
        method: "create",
        clientId: clientId,
        theClient: theClient,
        playerSlot: playerSlot,
        playerSlotHTML: playerSlotHTML,
        roomId: roomId
      };
      ws.send(JSON.stringify(payLoad));

      setTimeout(function () {
        playerJoin();
        $("#loading-screen").addClass("hide-element");
        $("#main-menu").addClass("hide-element");
        $("#game-room").removeClass("hide-element");
      }, 300);
    });

    btnOffline.addEventListener("click", (e) => {
      let offline = true;
      $("#loading-screen").removeClass("hide-element");
      Array.from(multiPlayerSpans).forEach((span) =>
        span.classList.add("hide-element")
      );

      const payLoad = {
        method: "create",
        clientId: clientId,
        theClient: theClient,
        playerSlot: playerSlot,
        playerSlotHTML: playerSlotHTML,
        roomId: roomId,
        offline: offline
      };
      ws.send(JSON.stringify(payLoad));

      setTimeout(function () {
        playerJoin();
        $("#loading-screen").addClass("hide-element");
        $("#main-menu").addClass("hide-element");
        $("#game-room").removeClass("hide-element");
      }, 300);
    });
  }, 200);

});

if(offline){
  document.getElementById("chatIcon").classList.add("hide-element");
}

document
  .getElementById("draggable-button")
  .addEventListener("click", function () {
    // document.getElementById("dealer-img").classList.add("hide-element");
    document.getElementById("aboutContainer").style.display = "flex";
  });

document.getElementById("closeBtn").addEventListener("click", function () {
  // document.getElementById("dealer-img").classList.remove("hide-element");
  document.getElementById("aboutContainer").style.display = "none";
});

const button = document.getElementById("draggable-button");

let isDragging = false;
let offsetY;

button.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetY = e.clientY - button.getBoundingClientRect().top;
  button.style.cursor = "grabbing";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  button.style.cursor = "grab";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const newY = e.clientY - offsetY;
    const maxY = window.innerHeight - button.offsetHeight;

    button.style.top = Math.min(Math.max(newY, 0), maxY) + "px";
  }
});


// Function to send a chat message
function sendMessage() {
  const message = chatInput.value.trim(); // Trim the message
  if (!message) return; // Don't send if the message is empty
  
  const mailer = theClient.nickname;

  const payLoad = {
    method: "chatMessage",
    clientId: clientId,
    text: message,
    gameId: gameId, // Use the actual gameId from your logic
    sender: mailer,
  };

  ws.send(JSON.stringify(payLoad));
  chatInput.value = ''; // Clear the input box after sending
}

// // Add only one event listener to the send button
 sendButton.removeEventListener('click', sendMessage); // Remove any existing listeners to prevent duplicates
sendButton.addEventListener('click', sendMessage);

// Function to display a chat message in the chat box
function displayMessage(sender, text, timestamp) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message');
  messageDiv.innerHTML = `<strong>${sender}</strong>: ${text}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
}



function playerJoin() {
  nickname = nickname.value;
  theClient.nickname = nickname.value;
  const payLoad = {
    method: "join",
    clientId: clientId,
    gameId: gameId,
    roomId: roomId,
    theClient: theClient,
    playerSlot: playerSlot,
    playerSlotHTML: playerSlotHTML,
    players: players,
    spectators: spectators,
    nickname: nickname
  };
  ws.send(JSON.stringify(payLoad));
}

function sendPlayerBets() {
  const payLoad = {
    method: "bet",
    players: players,
    spectators: spectators
  };
  ws.send(JSON.stringify(payLoad));
}

function updatePlayerCards() {
  const payLoad = {
    method: "updatePlayerCards",
    players: players,
    spectators: spectators,
    player: player,
    resetCards: resetCards
  };
  ws.send(JSON.stringify(payLoad));
}

function updateDealerCards() {
  const payLoad = {
    method: "updateDealerCards",
    players: players,
    spectators: spectators,
    player: player,
    dealer: dealer,
    dealersTurn: dealersTurn
  };
  ws.send(JSON.stringify(payLoad));
}

function sendPlayerDeck() {
  const payLoad = {
    method: "deck",
    players: players,
    spectators: spectators,
    deck: deck,
    clientDeal: clientDeal,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(payLoad));
}

function clientIsReady() {
  const payLoad = {
    method: "isReady",
    players: players,
    spectators: spectators,
    theClient: theClient
  };
  ws.send(JSON.stringify(payLoad));
}

function clientHasLeft() {
  const payLoad = {
    method: "hasLeft",
    players: players,
    spectators: spectators,
    theClient: theClient
  };
  ws.send(JSON.stringify(payLoad));
}

function updatePlayers() {
  const payLoad = {
    method: "update",
    players: players,
    spectators: spectators,
    dealer: dealer,
    deck: deck,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(payLoad));
}

function updateCurrentPlayer() {
  const payLoad = {
    method: "currentPlayer",
    players: players,
    spectators: spectators,
    player: player,
    dealersTurn: dealersTurn
  };
  ws.send(JSON.stringify(payLoad));
}

function sendPlayerThePlay() {
  const payLoad = {
    method: "thePlay",
    players: players,
    spectators: spectators,
    player: player,
    currentPlayer: currentPlayer,
    theClient: theClient,
    dealersTurn: dealersTurn,
    gameId: gameId
  };
  ws.send(JSON.stringify(payLoad));
}

function sendShowSum() {
  const payLoad = {
    method: "showSum",
    players: players,
    spectators: spectators
  };
  ws.send(JSON.stringify(payLoad));
}

function joinTable() {
  const payLoad = {
    method: "joinTable",
    players: players,
    spectators: spectators,
    theClient: theClient,
    theSlot: theSlot,
    playerSlotHTML: playerSlotHTML,
    gameId: gameId
  };
  ws.send(JSON.stringify(payLoad));
}

function updateTable() {
  const payLoad = {
    method: "updateTable",
    players: players,
    spectators: spectators,
    theClient: theClient,
    theSlot: theSlot,
    playerSlot: playerSlot
  };
  ws.send(JSON.stringify(payLoad));
}

function sendDealersTurn() {
  const payLoad = {
    method: "dealersTurn",
    players: players,
    spectators: spectators,
    dealersTurn: dealersTurn
  };
  ws.send(JSON.stringify(payLoad));
}

function terminatePlayer() {
  const payLoad = {
    method: "terminate",
    spectators: spectators,
    theClient: theClient,
    gameId: gameId,
    playerSlotHTML: playerSlotHTML,
    players: players,
    reload: reload,
    clientDeal: clientDeal,
    playersCanPlay: playersCanPlay,
    player: player,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(payLoad));
}

function resetRound() {
  const payLoad = {
    method: "resetRound",
    spectators: spectators,
    theClient: theClient
  };
  ws.send(JSON.stringify(payLoad));
}

function playerResult() {
  const payLoad = {
    method: "playerResult",
    spectators: spectators,
    players: players
  };
  ws.send(JSON.stringify(payLoad));
}

function playerResultNatural() {
  const payLoad = {
    method: "playerResultNatural",
    spectators: spectators,
    players: players,
    playerNaturalIndex: playerNaturalIndex
  };
  ws.send(JSON.stringify(payLoad));
}

function finalCompare() {
  const payLoad = {
    method: "finalCompare",
    gameId: gameId,
    spectators: spectators,
    players: players
  };
  ws.send(JSON.stringify(payLoad));
}

function resetGameState() {
  const payLoad = {
    method: "resetGameState",
    gameId: gameId,
    spectators: spectators,
    players: players
  };
  ws.send(JSON.stringify(payLoad));
}

window.addEventListener("load", (event) => {
  if (window.location.href.length - 1 > window.origin.length) {
    const str2 = window.location.href;
    getRouteId = str2.substring(str2.length - 6);
    const payLoadRoute = {
      method: "getRoute",
      getRouteId: getRouteId
    };
    ws.send(JSON.stringify(payLoadRoute));
  }
});

ws.onmessage = (message) => {
  const response = JSON.parse(message.data);
  if (response.method === "connect") {
    clientId = response.clientId;
    theClient = response.theClient;
  }

  if (response.method === "leave") {
    game = response.game;
    players = response.players;
    spectators = response.spectators;
    playerSlotHTML = response.playerSlotHTML;
    playerSlotIndex = response.playerSlotIndex;
    reload = false;
    oldPlayerIndex = response.oldPlayerIndex;
    gameOn = response.gameOn;

    if (spectators[oldPlayerIndex] === undefined) {
      $(".users-list-box:eq(" + oldPlayerIndex + ")").remove();
    }

    for (let i = 0; i < players.length; i++) {
      if (players[i].hasLeft === true) {
        if (playersCanPlay === false && players[i].clientId === clientDeal) {
          resetGameState();
        }
      }
    }

    if (gameOn === false) {
      if (playerSlotIndex === undefined || playerSlotIndex === null) {
        return;
      } else {
        playerSlot[playerSlotIndex].innerHTML = `
        <div><button class="ready hide-element">PLACE BET</button></div>
        <div class="empty-slot">+</div>
        <div class="player-name hide-element"></div>
        <div class="player-sum"></div>
        <div class="player-coin hide-element"><div class="player-bet hide-element"></div></div>
        <div class="player-result hide-element"></div>
        <div class="player-cards">

        </div>
        `;
      }
    }

    if (players.some((e) => e.clientId === clientId)) {
      if (!$(".empty-slot").is("noclick")) {
        $(".empty-slot").addClass("noclick");
      }
    }

    if (game.players.length === 0 && $("#dealerSum").text().length > 0) {
      dealersTurn = true;
      sendDealersTurn();
      dealerPlay();
    }

    if (
      gameOn === false &&
      players.length > 0 &&
      players.every((player) => player.isReady)
    ) {
      if (players[0].clientId === clientId && gameOn === false) startDeal();
    }
  }

  // create
  if (response.method === "create") {
    gameId = response.game.id;
    roomId = response.roomId;
    offline = response.offline;

    if (offline === true) {
      window.history.pushState("offline_page", "Offline Mode", "/");
      $("#invite-link-box").remove();
      $("#users-online-label").text("OFFLINE MODE");
    }
  }

  // join
  if (response.method === "join") {
    game = response.game;
    player = game.player;
    spectators = game.spectators;
    playerSlotHTML = response.playerSlotHTML;
    roomId = response.roomId;

    roomId = gameId.substring(gameId.length - 6);
    if (offline !== true) {
      window.history.pushState("game", "Title", "/" + roomId);
    }
  }

  // Assigns the "clientId" to "theClient" + some styling
  if (response.method === "joinClient") {
    theClient = response.theClient;
    game = response.game;
    players = response.players;
    spectators = game.spectators;
    playerSlotHTML = response.playerSlotHTML;

    $("#invite-link").val(gameId);

    setTimeout(function () {
      for (let i = 0; i < playerSlotHTML.length; i++) {
        for (let x = 0; x < spectators.length; x++) {
          if (spectators[x].clientId === playerSlotHTML[i]) {
            z = playerSlotHTML.indexOf(playerSlotHTML[i]);
            if (spectators[x].nickname === "")
              spectators[x].nickname = "Player";
            playerSlot[z].firstElementChild.nextElementSibling.innerText =
              spectators[x].nickname;
          }
        }
      }
    }, 50);

   
    for (let i = 0; i < spectators.length; i++) {
      if (spectators[i].nickname === "") spectators[i].nickname = "Player";
      $("#users-online-container").append(
        `
      <li class="users-list-box">
        <div class="users-list-info">
          <div class="user-list-name">` +
          spectators[i].nickname +
          `</div>
          <div>Balance: <span class="users-list-balance">` +
          spectators[i].balance +
          `</span></div>
        </div>
        <div class="users-list-img">
          <img src="/imgs/avatars/` +
          spectators[i].avatar +
          `.svg" alt="avatar">
        </div>
      </li>
      `
      );
      if (spectators[i].clientId === clientId) {
        $(".user-list-name:eq(" + i + ")").addClass("highlight");
      }
    }
  }

 
  if (response.method === "updateClientArray") {
    players = response.players;
    newPlayer = response.newPlayer;
    playerSlotHTML = response.playerSlotHTML;

   
    if (spectators.length > $("#users-online-container").children().length) {
      if (newPlayer.nickname === "") newPlayer.nickname = "Player";
      $("#users-online-container").append(
        `
      <li class="users-list-box">
        <div class="users-list-info">
          <div class="user-list-name">` +
          newPlayer.nickname +
          `</div>
          <div>Balance: <span class="users-list-balance">` +
          newPlayer.balance +
          `</span></div>
        </div>
        <div class="users-list-img">
          <img src="/imgs/avatars/` +
          newPlayer.avatar +
          `.svg" alt="avatar">
        </div>
      </li>
      `
      );
    }
  }


  if (response.method === "joinMidGame") {
    theClient = response.theClient;
    game = response.game;
    // spectators = game.spectators
    players = game.players;
    playerSlotHTML = game.playerSlotHTML;
    player = game.player;
    dealer = game.dealer;
    gameOn = game.gameOn;

    
    $("#invite-link").val(gameId);
    
    $("#join-mid-game-label").removeClass("hide-element");

    
    setTimeout(function () {
      for (let i = 0; i < spectators.length; i++) {
        if (spectators[i].nickname === "") spectators[i].nickname = "Player";
        $("#users-online-container").append(
          `
        <li class="users-list-box">
          <div class="users-list-info">
            <div class="user-list-name">` +
            spectators[i].nickname +
            `</div>
            <div>Balance: <span class="users-list-balance">` +
            spectators[i].balance +
            `</span></div>
          </div>
          <div class="users-list-img">
            <img src="/imgs/avatars/` +
            spectators[i].avatar +
            `.svg" alt="avatar">
          </div>
        </li>
        `
        );
        if (spectators[i].clientId === clientId) {
          $(".user-list-name:eq(" + i + ")").addClass("highlight");
        }
      }
    }, 200);

   
    for (let x = 0; x < players.length; x++) {
      for (let i = 0; i < playerSlotHTML.length; i++) {
        if (players[x].clientId === playerSlotHTML[i]) {
          z = playerSlotHTML.indexOf(playerSlotHTML[i]);
          if (
            playerSlot[
              z
            ].firstElementChild.nextElementSibling.classList.contains(
              "empty-slot"
            )
          )
            playerSlot[z].firstElementChild.nextElementSibling.remove();
        }
      }
    }

    for (let i = 0; i < playerSlotHTML.length; i++) {
      for (let x = 0; x < players.length; x++) {
        if (players[x].clientId === playerSlotHTML[i]) {
          z = playerSlotHTML.indexOf(playerSlotHTML[i]);
          if (players[x].nickname === "") players[x].nickname = "Player";
          playerSlot[z].firstElementChild.nextElementSibling.innerText =
            players[x].nickname;
        
        }
      }
    }

 
    for (let i = 0; i < players.length; i++) {
      for (let d = 0; d < deckImg.length; d++) {
        for (let c = 0; c < players[i].cards.length; c++) {
          if (
            players[i].cards[c].suit + players[i].cards[c].value.card ===
            deckImg[d]
          ) {
            // Now apply the cards to the right table slot.
            for (let s = 0; s < playerSlotHTML.length; s++) {
              if (players[i].clientId === playerSlotHTML[s]) {
                cardIndexJoin++;
                playerSlot[s].lastElementChild.innerHTML +=
                  `<img class="cardImg` +
                  " card" +
                  cardIndexJoin +
                  `" src="/imgs/` +
                  deckImg[d] +
                  `.svg">`;
              }
            }
          }
        }
      }
    }

    
    if (game.spectators.slice(-1)[0].clientId === clientId) {
      for (let d = 0; d < deckImg.length; d++) {
        for (let c = 0; c < dealer.cards.length; c++) {
          if (
            dealer.cards[c].suit + dealer.cards[c].value.card ===
            deckImg[d]
          ) {
            dealerSlot.lastElementChild.firstElementChild.innerHTML +=
              `<img class="dealerCardImg" src="/imgs/` + deckImg[d] + `.svg">`;
          }
        }
      }
    }

    
    if (
      dealer.hiddenCard.length === 0 ||
      dealer.hiddenCard.length === undefined
    ) {
      return;
    } else {
      dealerSlot.lastElementChild.firstElementChild.innerHTML += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">

          </div>
          <div class="flip-card-back">

          </div>
        </div>
      </div>
      `;
      $(".flip-card-front").html(
        `<img class="dealerCardImg" src="/imgs/Card_back.svg">`
      );

      setTimeout(function () {
        $(".flip-card-back").html(
          `<img class="dealerCardImg" src="/imgs/` +
            dealersHiddenCard +
            `.svg">`
        );
      }, 50);
      $(".dealer-cards").css("margin-left", "-=90px");
    }

    if (dealer.sum > 0) {
      for (let i = 0; i < players.length; i++) {
        for (let s = 0; s < playerSlotHTML.length; s++) {
          if (players[i].clientId === playerSlotHTML[s]) {
            playerSlot[
              s
            ].firstElementChild.nextElementSibling.nextElementSibling.style.opacity =
              "1";
            playerSlot[
              s
            ].firstElementChild.nextElementSibling.nextElementSibling.style.transform =
              "scale(1)";
          }
        }
      }
      $("#dealerSum").removeClass("hide-element");
      dealerSlot.firstElementChild.nextElementSibling.style.opacity = "1";
      dealerSlot.firstElementChild.nextElementSibling.style.transform =
        "scale(1)";
    }

    setPlayersBet();

    if (game.players.length === 0) {
      resetGame();
    }
  }

  if (response.method === "joinMidGameUpdate") {
    spectators = response.spectators;
    newPlayer = response.newPlayer;

    if (players.length > 0) {
      const payLoad = {
        method: "dealersHiddenCard",
        spectators: spectators,
        dealersHiddenCard: dealersHiddenCard
      };
      if (
        players[players.findIndex((players) => players.hasLeft === false)]
          .clientId === clientId
      ) {
        ws.send(JSON.stringify(payLoad));
      }
      if (players.length === 1 && players[0].hasLeft === true) {
        for (let i = 0; i < players.length; i++) {
          for (let s = 0; s < spectators.length; s++) {
            if (players[i].hasLeft === true) {
              if (spectators[s].clientId === players[i].clientId) {
                spectators[s].hasLeft = true;
              }
            }
          }
        }
        resetGame();
      }
    } else {
      resetGame();
    }

    if (newPlayer.clientId === clientId) {
      
    } else {
      if (spectators.length > $("#users-online-container").children().length) {
        if (newPlayer.nickname === "") newPlayer.nickname = "Player";
        $("#users-online-container").append(
          `
        <li class="users-list-box">
          <div class="users-list-info">
            <div class="user-list-name">` +
            newPlayer.nickname +
            `</div>
            <div>Balance: <span class="users-list-balance">` +
            newPlayer.balance +
            `</span></div>
          </div>
          <div class="users-list-img">
            <img src="/imgs/avatars/` +
            newPlayer.avatar +
            `.svg" alt="avatar">
          </div>
        </li>
        `
        );
      }
    }
  }

  if (response.method === "dealersHiddenCard") {
    dealersHiddenCard = response.dealersHiddenCard;
  }

  // bet
  if (response.method === "bet") {
    players = response.players;

    // Assign players balance to the list
    for (let i = 0; i < spectators.length; i++) {
      for (let x = 0; x < players.length; x++) {
        if (spectators[i].clientId === players[x].clientId) {
          spectators[i].balance = players[x].balance;
        }
      }
      $(".users-list-balance:eq(" + i + ")").text(spectators[i].balance);
      if (spectators[i].balance === 0)
        $(".users-list-balance:eq(" + i + ")").addClass("color-red");
    }
  }
  // deck
  if (response.method === "deck") {
    players = mapOrder(players, playerSlotHTML, "clientId");
    deck = response.deck;
    clientDeal = response.clientDeal;
    gameOn = response.gameOn;

    // Optimize this later so it doesnt fire like every second
    if (gameOn) {
      for (let i = 0; i < players.length; i++) {
        if (players[i].clientId === clientId) {
          $("#bets-container").addClass("noclick");
        }
      }
      $(".empty-slot").addClass("noclick");
      $("#deal-start-label").addClass("hide-element");
    }
  }

  if (response.method === "isReady") {
    players = response.players;
    setPlayersBet();
    if (
      players.length > 1 &&
      players.every((player) => player.isReady) === false &&
      timerStarted === false
    ) {
      timerStarted = true;
      startTimer();
    }
  }

  if (response.method === "hasLeft") {
    players = response.players;
    spectators = response.spectators;
  }

  // currentPlayer
  if (response.method === "currentPlayer") {
    player = response.player;
  }

  if (response.method === "updatePlayerCards") {
    dealingSound.play();
    resetCards = response.resetCards;
    players = response.players;
    player = response.player;

    if (player !== undefined) cardIndex = player.cards.length;

    for (let i = 0; i < playerSlotHTML.length; i++) {
      if (player.clientId === playerSlotHTML[i]) {
        z = playerSlotHTML.indexOf(playerSlotHTML[i]);

        for (let c = 0; c < deckImg.length; c++) {
          if (
            player.cards.slice(-1)[0].suit +
              player.cards.slice(-1)[0].value.card ===
            deckImg[c]
          ) {
            playerSlot[z].lastElementChild.innerHTML +=
              `<img class="cardImg` +
              " card" +
              cardIndex +
              ` cardAnimation" src="/imgs/` +
              deckImg[c] +
              `.svg">`;
          }
        }

        // Animation
        setTimeout(function () {
          $(
            ".players:eq(" +
              playerSlotHTML.indexOf(playerSlotHTML[i]) +
              ") .player-cards"
          )
            .children()
            .removeClass("cardAnimation");
        }, 50);
      }
    }
  }

  if (response.method === "updateDealerCards") {
    dealingSound.play();
    // dealerHiddenCardRemoveNext = response.dealerHiddenCardRemoveNext
    dealersTurn = response.dealersTurn;
    if (dealersTurn === false) {
      dealer = response.dealer;
    } else {
      player = response.player;
      dealer = player;
    }

    if (
      dealer.hiddenCard.length === 0 ||
      dealer.hiddenCard.length === undefined
    ) {
      if (
        $(".flip-card-inner").css("transform") !== "none" ||
        dealer.cards.length === 1
      ) {
        for (let c = 0; c < deckImg.length; c++) {
          if (
            dealer.cards.slice(-1)[0].suit +
              dealer.cards.slice(-1)[0].value.card ===
            deckImg[c]
          ) {
            dealerSlot.lastElementChild.firstElementChild.innerHTML +=
              `<img class="dealerCardImg cardAnimationDealer" src="/imgs/` +
              deckImg[c] +
              `.svg">`;
          }
        }
      }
      // Animation
      setTimeout(function () {
        $(".visibleCards").children().removeClass("cardAnimationDealer");
      }, 50);

      if (dealer.hiddenCard.length === 0 && dealer.cards.length === 2) {
        $(".flip-card-inner").css("transform", "rotateY(-180deg)");
      } else {
        $(".dealer-cards").css("margin-left", "-=45px");
      }
    } else {
      // dealerSlot.lastElementChild.innerHTML +=
      dealerSlot.lastElementChild.firstElementChild.innerHTML += `
      <div class="flip-card cardAnimationDealer">
        <div class="flip-card-inner">
          <div class="flip-card-front">

          </div>
          <div class="flip-card-back">

          </div>
        </div>
      </div>
      `;

      // setTimeout(function() {
      $(".flip-card-front").html(
        `<img class="dealerCardImg" src="/imgs/Card_back.svg">`
      );
      $(".flip-card-back").html(
        `<img class="dealerCardImg" src="/imgs/` +
          dealer.hiddenCard[0].suit +
          dealer.hiddenCard[0].value.card +
          `.svg">`
      );
      dealersHiddenCard =
        dealer.hiddenCard[0].suit + dealer.hiddenCard[0].value.card;
      // }, 1)
      setTimeout(function () {
        $(".flip-card").removeClass("cardAnimationDealer");
      }, 50);

      // dealerSlot.lastElementChild.firstElementChild.innerHTML +=
      //   `<img class="dealerCardImg" src="/imgs/` + deckImg[c] + `.svg">`
      // `<img class="dealerCardImg" src="/imgs/Card_back.svg">`;
      // `
      // <div class="hiddenCard ">
      //   <img src="/imgs/Card_back.svg" alt="">
      // </div>
      // `;
      $(".dealer-cards").css("margin-left", "-=45px");
      // Animation
      setTimeout(function () {
        $(".hiddenCard").removeClass("cardAnimationDealer");
      }, 50);

      // dealerHiddenCard = document.querySelector(".hiddenCard")
      // dealerHiddenCardRemoveNext = true;
    }
  }

  // update
  if (response.method === "update") {
    players = response.players;
    dealer = response.dealer;
    deck = response.deck;
    gameOn = response.gameOn;

    // If every player in players arras has left, reset game
    setTimeout(function () {
      if (players.every((player) => player.hasLeft)) {
        resetGame();
      }
    }, 50);
  }

  // the playe
  if (response.method === "thePlay") {
    player = response.player;
    currentPlayer = response.currentPlayer;
    playersCanPlay = true;

    // Highlight current player sum so we know who's turn it is
    $(".player-sum").removeClass("current-player-highlight");
    // for (let i = 0; i < playerSlotHTML.length; i++) {
    //   if (playerSlotHTML[i] === player.clientId) {
    //     $(".player-sum:eq(" + i + ")").addClass("current-player-highlight");
    //     setTimeout(function () {
    //       $(".players-timer:eq(" + i + ") circle").addClass("circle-animation");
    //     }, 50);
    //   }
    // }

    if (dealersTurn) {
      return;
    } else {
      if (
        (player.clientId === clientId && player.sum < 21) ||
        (player.clientId === clientId && theClient.sum.length > 1)
      ) {
        clicked = false;
        thePlay();
      } else if (player.clientId === clientId && player.sum >= 21) {
        sendPlayerNext();
      } else {
        clicked = true;
      }
    }

    for (let i = 0; i < players.length; i++) {
      if (
        players[currentPlayer] !== undefined &&
        players[currentPlayer].hasLeft === true
      ) {
        currentPlayer = currentPlayer + 1;
        player = players[currentPlayer];
      } else {
        break;
      }
    }
  }

  if (response.method === "sendPlayerNextWs") {
  }
  if (response.method === "showSum") {
    players = response.players;

    // Show sum for each player
    for (let i = 0; i < playerSlotHTML.length; i++) {
      if (playerSlot[i] && playerSlot[i].firstElementChild) {
        const sumElement =
          playerSlot[i].firstElementChild.nextElementSibling
            ?.nextElementSibling;
        if (sumElement) {
          sumElement.style.opacity = "1";
          sumElement.style.transform = "scale(1)";
        }
      }
    }

    // Show dealer's sum
    if (dealerSlot && dealerSlot.firstElementChild) {
      const dealerSumElement = dealerSlot.firstElementChild.nextElementSibling;
      if (dealerSumElement) {
        dealerSumElement.style.opacity = "1";
        dealerSumElement.style.transform = "scale(1)";
      }
    }
  }

  // Join Table
  if (response.method === "joinTable") {
    game = response.game;
    spectators = response.spectators;
    players = response.players;
    theSlot = response.theSlot;
    user = response.user;
    // theClient = response.theClient
    playerSlotHTML = response.playerSlotHTML;

    // Set player Name & player Avatar when someone joins table
    for (let i = 0; i < playerSlotHTML.length; i++) {
      for (let x = 0; x < players.length; x++) {
        if (players[x].clientId === playerSlotHTML[i]) {
          z = playerSlotHTML.indexOf(playerSlotHTML[i]);
          if (players[x].nickname === "") players[x].nickname = "Player";
          playerSlot[
            z
          ].firstElementChild.nextElementSibling.nextElementSibling.innerText =
            players[x].nickname;
          playerSlot[
            z
          ].firstElementChild.nextElementSibling.nextElementSibling.innerHTML += ` `;
        }
      }
    }
  }

  if (response.method === "dealersTurn") {
    dealersTurn = response.dealersTurn;
    playersCanPlay = false;
    if (dealersTurn === true) {
      $(".player-sum").removeClass("current-player-highlight");
      $("#dealerSum").addClass("current-player-highlight");
    }
  }

  // Checks if party room is full
  if (response.method === "playersLength") {
    playersLength = response.playersLength;
  }

  if (response.method === "playerResultNatural") {
    players = response.players;
    playerNaturalIndex = response.playerNaturalIndex;
    $(".player-result:eq(" + playerNaturalIndex + ")").removeClass(
      "hide-element"
    );
    $(".player-result:eq(" + playerNaturalIndex + ")").addClass(
      "result-blackjack"
    );
    $(".player-result:eq(" + playerNaturalIndex + ")").text("BJ");
  }

  if (response.method === "finalCompare") {
    finalCompareGo();
  }

  if (response.method === "resetGameState") {
    game = response.game;
    resetGame();
  }

  if (response.method === "redirect") {
    window.location.href = "/";
  }

  if (response.method === "startTimer") {
    startTimer();
  }

  // Ensure we're handling the correct method
  if (response.method === "chatMessage") {
    const { sender, text, timestamp } = response;
    const {spec, uarr} = response;
    displayMessage(sender, text, timestamp);


    document.getElementById("chatIconImage").src = '../imgs/chatOpen.png'; // Change the image to chatOpen.png

    // Add shake animation class
    document.getElementById("chatIcon").classList.add('shake');

    // Remove the class after the animation ends
    document.getElementById("chatIcon").addEventListener('animationend', function() {
        document.getElementById("chatIcon").classList.remove('shake');
    }, { once: true });

    setTimeout(() => {
      document.getElementById("chatIconImage").src = '../imgs/chatClosed.png';
    }, 4000);

  }

  // This updates theClient and players array accordingly
  if (
    response.method === "connect" ||
    response.method === "create" ||
    response.method === "joinClient" ||
    response.method === "join" ||
    response.method === "playersLength" ||
    response.method === "playerResult" ||
    response.method === "playerResultNatural" ||
    response.method === "getRoute"
  ) {
    return;
  } else {
    updateAllPlayers();
    syncTheGame();
  }
}; // <------ End of ws message listener

// Keep everything in sync
function updateAllPlayers() {
  // // UPDATE SPECTATORS STATUS (IMPORTANT TO HAVE THIS AVOVE PLAYERS STATUS, ELSE IT WILL OVERRIDE)
  for (let i = 0; i < spectators.length; i++) {
    if (spectators[i].clientId === clientId) {
      spectators[i].bet = theClient.bet;
      theClient = spectators[i];
    }
  }

  // // UPDATE PLAYERS STATUS
  for (let i = 0; i < players.length; i++) {
    if (players[i].clientId === clientId) {
      players[i].bet = theClient.bet;
      theClient = players[i];
    }

    // Keep the values for game array in sync, so when a player joins mid game, everything will display correctly.
    // for(let g = 0; g < game.players.length; g++) {
    //   game.players[g].cards = players[i].cards

    // }
  }

  // UPDATE STYLE ON TABLE
  for (let i = 0; i < playerSlotHTML.length; i++) {
    if (playerSlotHTML[i] === clientId) clientId = playerSlotHTML[i];

    for (let x = 0; x < players.length; x++) {
      if (players[x].clientId === playerSlotHTML[i]) {
        z = playerSlotHTML.indexOf(playerSlotHTML[i]);
        if (
          playerSlot[z].firstElementChild.nextElementSibling.classList.contains(
            "empty-slot"
          )
        )
          playerSlot[z].firstElementChild.nextElementSibling.remove();
        playerSlot[z].firstElementChild.nextElementSibling.classList.remove(
          "hide-element"
        );
        playerSlot[
          z
        ].firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.classList.remove(
          "hide-element"
        );
        playerSlot[
          z
        ].firstElementChild.nextElementSibling.nextElementSibling.innerHTML =
          players[x].sum;
        if (players[x].sum > 21) {
          $(".player-result:eq(" + z + ")").removeClass("hide-element");
          $(".player-result:eq(" + z + ")").addClass("result-lose");
          $(".player-result:eq(" + z + ")").text("BUST");
        }
      }
    }
  }

  // Update Dealer Sum
  dealerSlot.firstElementChild.nextElementSibling.innerHTML = dealer.sum;
  // Update player
  player = players[currentPlayer];
  // Keep user style balance in sync
  if (theClient.blackjack === false) $("#balance").text(theClient.balance);
}

// Keep game.(property) in sync with the actual game, so when a new client joins mid game, all "LOGIC" will syn.
function syncTheGame() {
  const syncGame = {
    method: "syncGame",
    gameId: gameId,
    player: player,
    players: players,
    spectators: spectators,
    playerSlotHTML: playerSlotHTML,
    dealer: dealer,
    gameOn: gameOn
  };
  ws.send(JSON.stringify(syncGame));
}

// Player joins a slot on the table
for (let s = 0; s < playerSlot.length; s++) {
  (function (index) {
    playerSlot[s].addEventListener("click", function () {
      if (
        joined === false &&
        this.firstElementChild.nextElementSibling.classList.value ===
          "empty-slot" &&
        gameOn === false
      ) {
        joined = true;
        theSlot = index;
        joinTable();
        // Make player text yellow
        $(this).children("div:nth-child(3)").addClass("highlight");
        $("#bets-container").removeClass("noclick");
        $(".empty-slot").addClass("noclick");
      }
    });
  })(s);
}

function setPlayersBet() {
  for (let s = 0; s < playerSlotHTML.length; s++) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].isReady && players[i].clientId === playerSlotHTML[s]) {
        // players[i].isReady = false;
        if (players[i].bet >= 10 && players[i].bet < 50) {
          chipIndex = "White";
        } else if (players[i].bet >= 50 && players[i].bet < 100) {
          chipIndex = "Red";
        } else if (players[i].bet >= 100 && players[i].bet < 500) {
          chipIndex = "Blue";
        } else if (players[i].bet >= 500 && players[i].bet < 1000) {
          chipIndex = "Green";
        } else if (players[i].bet >= 1000 && players[i].bet < 5000) {
          chipIndex = "Gray";
        } else if (players[i].bet >= 5000 && players[i].bet < 10000) {
          chipIndex = "Orange";
        } else if (players[i].bet >= 10000 && players[i].bet < 50000) {
          chipIndex = "Purple";
        } else if (players[i].bet >= 50000 && players[i].bet < 100000) {
          chipIndex = "Brown";
        } else if (players[i].bet >= 100000) {
          chipIndex = "Black";
        }
        $(".players:eq(" + s + ") .player-bet").text(players[i].bet);
        $(".players:eq(" + s + ") .player-coin").css(
          "background",
          "url(/imgs/chips/Casino_Chip_" + chipIndex + ".svg)"
        );
        if (players[i].bet > 999) {
          $(".players:eq(" + s + ") .player-coin").html(
            $(".players:eq(" + s + ") .player-bet")
              .text()
              .slice(0, -3) +
              "K" +
              `<div class="player-bet hide-element"></div>`
          );
        } else {
          $(".players:eq(" + s + ") .player-coin").html(
            $(".players:eq(" + s + ") .player-bet").text() +
              `<div class="player-bet hide-element"></div>`
          );
        }
        $(".players:eq(" + s + ") .player-bet").text(players[i].bet);

        setTimeout(function () {
          $(".players:eq(" + s + ") .player-coin").addClass(
            "player-coin-animation"
          );
        }, 50);
      }
    }
  }
}

setTimeout(joinByUrl, 200);
function joinByUrl() {
  // If player has a roomId in his url
  if (window.location.href.length - 1 > window.origin.length) {
    // Get last 6 values from url
    const str = window.location.href;
    roomId = str.substring(str.length - 6);
    gameId = `${location.origin}/` + roomId;

    // To prevent bug at 714
    playerSlotIndex = [];
  }
}

// Before player exits/resets window, terminate him from the room
window.addEventListener("beforeunload", function () {
  reload = true;
  theClient.hasLeft = true;
  if (
    playersCanPlay === true &&
    player.clientId === clientId &&
    players.length > 1
  ) {
    sendPlayerNext();
  }
  terminatePlayer();
});
