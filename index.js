/*
TODO
1. Implement web audio API
*/

//MODEL
var model = {
  
  gameActive : false,
  playerTurn : false,
  strict : false,
  step : 0,
  
  cpu : {
    sequence : []
  },
  
  player : {
    sequence : []
  }
}


//CONTROLLER
function controller() {
  let timeoutID, pauseID, index, priorMoves;
  const sqKeys = document.querySelectorAll('.gameSq');
  const audioKeys = document.querySelectorAll('audio');
  
  function randomSq() {
    let rndInt = Math.floor(Math.random() * 4);
    model.cpu.sequence.push(rndInt);
  }
  controller.randomSq = randomSq;
  
  function p1Focus(pos) {
    sqKeys[pos].style.opacity = "0.4";
    controller.playSound(pos);
    timeoutID = setTimeout(function(){sqKeys[pos].style.opacity="1"}, 800);
    
  }
  controller.p1Focus = p1Focus;
  
  function cpuFocus() {
    let cpuSeq = model.cpu.sequence;
    var i = 0;
    
    priorMoves = setInterval(function(){
      highlight(cpuSeq[i]);
      i++;
      if (i >= cpuSeq.length) {
         clearInterval(priorMoves);
       }
      view.errorMsg(false);
      },1200);
    
    function highlight (thisSq) {
      sqKeys[thisSq].style.opacity="0.4";
      controller.playSound(thisSq);
      setTimeout(function(){
        sqKeys[thisSq].style.opacity="1";
      },800);
    }
    
  }
  controller.cpuFocus = cpuFocus;
  
  function playSound(id) {
    audioKeys[id].play();
  }
  controller.playSound = playSound;
  
  function startGame(id) {
    if (!model.gameActive) {
      model.gameActive = true;
      view.showGameStatus(true);
      controller.takeTurn(model.playerTurn,id,function(){
        changeTurn(function(){});
      });
      

      view.showStep(1);
    }
    
  }
  controller.startGame = startGame;
  
  function resetGame() {
    clearInterval(priorMoves);
    model.player.sequence = [];
    model.cpu.sequence = [];
    model.playerTurn = false;
    index = 0;
    model.step = 0;
    view.showStep(model.step);
    model.gameActive = false;
    view.btnFocus('startBtn',"","");
    view.errorMsg(false);
    view.showGameStatus(false);
  }
  controller.resetGame = resetGame;
  
  function replay() {
    cpuFocus();
    model.player.sequence = [];
    index=0;
    
    
  }
  controller.replay = replay;
  
  function changeTurn(callback) {
     if (model.playerTurn) {
       model.playerTurn = false;
     } else {
       model.playerTurn = true;
     };
    callback();
    
  }
  controller.changeTurn = changeTurn;
  
  function winCheck(){
    if (model.step >= 20) {
      
      view.winMsg();
      model.gameActive = false;
      return true;
    }
  }
  controller.winCheck = winCheck;
  
  function takeTurn(isPlayerTurn,text,callback) {
    let p1Seq = model.player.sequence;
    if (!isPlayerTurn && model.gameActive) {
      
        if (controller.winCheck()) {
          return;
        } else {
            controller.randomSq();
            cpuFocus();
            model.step ++;
            model.player.sequence = [];
            index=0;
            view.showStep(model.step);
            callback();
          
        }
        
    } else if (isPlayerTurn) {
      
        if (text==model.cpu.sequence[index]) {
          p1Seq.push(text);
          p1Focus(p1Seq[p1Seq.length-1]);
          index ++;
        } else {
          if (model.strict) {
            controller.resetGame();
          } else {
            view.errorMsg(true);
            controller.replay();
          }
        }
      

    }
    if (p1Seq >= model.cpu.sequence) {
      callback();  
    }
    
  }
  controller.takeTurn = takeTurn;
  
  //click event
  function cEvent(id,textContent) {
    clearInterval(priorMoves);
    if (id === "startBtn") {
      controller.startGame(id);
      view.btnFocus(id,"green","green");
    } else if (id=== "resetBtn") {
      controller.resetGame();
    } else if (id === "strictBtn") {
      if (!model.strict) {
        model.strict = true;
        view.strictMode(true);
      } else {
        model.strict = false;
        view.strictMode(false);
      }
      
      view.btnFocus(id,"green","");
      
    
    } else if (model.playerTurn) {
      controller.takeTurn(model.playerTurn,textContent,function(){
        controller.changeTurn(function(){
          controller.takeTurn(model.playerTurn,"",function(){
            controller.changeTurn(function(){});
          });
        });
      });
      
    }
    
  }
  controller.cEvent = cEvent;
}

//VIEW
function view() {
  
  const sqKeys = document.querySelectorAll('.gameSq');
  const setKeys = Array.from(document.querySelectorAll('.btn'));
  const statusKeys = document.querySelectorAll('.statusText');
  
  
  for (var i = 0; i<setKeys.length; i++ ) {
    setKeys[i].onclick = function() {
      controller.cEvent(this.id,this.innerHTML);
    }
  }
  
  for (var i = 0; i<sqKeys.length; i++) {
    sqKeys[i].onclick = function() {
      controller.cEvent(this.id,this.innerHTML);
    }
  }
  
  function showStep (step) {
    document.querySelector('#stepCount').innerHTML = step;
  }
  view.showStep = showStep;
  
  function btnFocus (btnID,focusColor,cDefault) {
    var ele = document.getElementById(btnID);
    if (ele.style.color === focusColor) {
      ele.style.color = cDefault;
    } else {
      ele.style.color = focusColor;
    }
    
    
  }
  view.btnFocus = btnFocus;
  
  function errorMsg(truth) {
    let output = document.querySelector('#msgText');
    if (truth) {
      output.innerHTML = "!!";
    } else {
      output.innerHTML = "";
    }
  }
  view.errorMsg = errorMsg;
  
  function showGameStatus(bool) {
    if (bool) {
      statusKeys[2].innerHTML = "Game is Active";
    } else {
      statusKeys[2].innerHTML = "Game is Paused";
    }
  }
  view.showGameStatus = showGameStatus;
  
  function winMsg() {
    document.querySelector('#msgText').innerHTML = "WINNER! <br> press reset to play again!";
  }
  view.winMsg = winMsg;
  
  function strictMode(bool){
    if (bool) {
      statusKeys[0].innerHTML = "Strict Mode: On";
    } else {
      statusKeys[0].innerHTML = "Strict Mode: Off";
    }
  }
  view.strictMode = strictMode;
  
  
}

//INIT
var model = model || {};
controller();
view();