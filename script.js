let user = {name:"", elo:1200, wallet:500};
let matches = [];
let currentMatch = null;
let game, board;

function updateUI(){
  document.getElementById("usernameDisplay").innerText=user.name;
  document.getElementById("walletDisplay").innerText=user.wallet;
  document.getElementById("eloDisplay").innerText=user.elo;
}

function login(){
  const name=document.getElementById("usernameInput").value.trim();
  if(!name) return alert("Enter a username");
  user.name=name;

  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
  updateUI();
}

// ---------------- MATCH CREATION ----------------

function createMatch(){
  const stake = Number(document.getElementById("stakeAmount").value);
  if(stake<10) return alert("Minimum stake = 10");
  if(stake>user.wallet) return alert("Not enough balance");

  let id=Math.random().toString(36).slice(2,8);
  matches.push({id, stake, player1:user.name, player2:null});

  user.wallet -= stake;
  updateUI();
  renderMatches();
}

function renderMatches(){
  const box=document.getElementById("matchList");
  box.innerHTML="";
  matches.forEach(m=>{
    let div=document.createElement("div");
    div.innerHTML=`
      <p>Match #${m.id}</p>
      <p>Stake: ${m.stake} credits</p>
      ${m.player2? "<i>Full</i>" : `<button onclick="joinMatch('${m.id}')">Join</button>`}
    `;
    box.appendChild(div);
  });
}

// --------------- JOIN + START GAME ----------------

function joinMatch(id){
  let m=matches.find(x=>x.id===id);
  if(!m) return;
  if(m.player2) return alert("Already full");
  if(user.wallet < m.stake) return alert("Not enough balance");

  m.player2=user.name;
  user.wallet -= m.stake;
  updateUI();
  startGame(m);
}

function startGame(match){
  currentMatch=match;

  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  document.getElementById("matchIdDisplay").innerText=match.id;
  document.getElementById("stakeDisplay").innerText=match.stake;
  document.getElementById("prizeDisplay").innerText=(match.stake*2)+" credits";

  game=new Chess();
  board=Chessboard('board',{
    draggable:true,
    position:'start',
    onDrop:onMove
  });
  updateStatus();
}

function onMove(source,target){
  if(!game.move({from:source,to:target,promotion:'q'}))
      return "snapback"; // illegal move
  updateStatus();
}

function updateStatus(){
  if(game.game_over()){
    let winner = game.in_checkmate()? user.name : "Draw";
    alert("Game Over! Winner: "+winner);

    if(winner===user.name){
      user.wallet += currentMatch.stake*2;
      user.elo += 10;
    } else {
      user.elo -= 10;
    }
    updateUI();
    exitGame();
  }
}

function exitGame(){
  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
  renderMatches();
}
