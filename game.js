var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var ticker = setInterval(frameTick, 23);
var coinImg = new Image();
coinImg.src = "coin.png";
//var obstacles = [new obstacle("ground",0,240,640,120)];
//var player = new player(120, 120, 5, 0);
const gravity = 3;
const jumpSpeed = -20;
const speedIncrease = 10;
const playerWidth = 10;
const halfPlayerWidth = playerWidth / 2;
const obstacleThick = 10;
const halfObstacleThick = obstacleThick / 2;
const coinRadius = 20;
const groundHeight = 20;
var momentum = 0;
var right = false, left = false, holdSpace = false;
var airborne = false;
var dynamicCamera = true;

var gamemode = 0;
var floorIsLava = false;
var flappyBird = false, flappyAgain = true;
var gliding = false;

var player = {
  x: 120,
  y: 120,
  speedX: 5,
  speedY: 0,
  move: function(){
    //move
    if(right == true){
      this.speedX = speedIncrease;
      this.x += this.speedX;
    }else if(left == true){
      this.speedX = -speedIncrease;
      this.x += this.speedX;
    }else if(right == false && left == false){
      this.speedX = 0;
    }
    //keep within bounds
    if(this.x <= halfPlayerWidth)
      this.x = halfPlayerWidth + 1;
    /*else if(this.x >= canvas.width - halfPlayerWidth)
      this.x = canvas.width - halfPlayerWidth - 1;*/

    //keep on ground
    if(this.y + this.speedY < canvas.height - groundHeight)
      this.y += this.speedY;
    else{
      this.y = canvas.height - groundHeight - halfPlayerWidth;
      airborne = false;
      if(floorIsLava){
        gameOver(1);
      }
    }
    if(this.y < this.y + this.speedY && holdSpace && gliding){
      this.speedY = 1;
    }
    this.speedY += gravity;
  },
  jump: function(){
    if(airborne == false)
      player.speedY = jumpSpeed;
    else if(flappyBird && flappyAgain){ //flappy bird mode
      obstacles.push({
        x: player.x - 4*playerWidth,
        y: player.y + playerWidth,
        width: 8*playerWidth,
        type: "sonic-platform"
      });
      player.speedY = jumpSpeed;
    }
  }
}
var obstacles = [
  {x: 100, y: 180, width: 240, type: "sonic-platform"},
  {x: 240, y: 260, width: 240, type: "sonic-platform"},
  {x: 200, y: 100, width: 100, type: "sonic-platform"},
  {x: 400, y: 100, width: 100, type: "sonic-platform"},
  {x: 840, y: 260, width: 240, type: "sonic-platform"},
  {x: 800, y: 100, width: 100, type: "sonic-platform"},
  {x: 1000, y: 100, width: 100, type: "sonic-platform"},
  {x: 550, y: 305, width: 90, type: "sonic-platform"},
  {x: 1150, y: 305, width: 90, type: "sonic-platform"},
  {x: 600, y: 40, width: 10, type: "coin"},
];
var camera = {
  x: canvas.width/2,
  offset: 0,
  update: function(){
    if(!dynamicCamera){
      if(player.x < canvas.width/2){
        this.x = canvas.width/2;
      }else if(player.x >= canvas.width/2){
        this.x = player.x;
      }
      if(this.x <= canvas.width/2)
        this.offset = 0;
      else
        this.offset = this.x - canvas.width/2;
    }else{
      if(this.x - player.x > canvas.width / 6){
        this.x = player.x + canvas.width / 6
      }else if(this.x - player.x < -1 * canvas.width / 6){
        this.x = player.x - canvas.width / 6
      }
      this.offset = this.x - canvas.width/2;
    }
  },
  draw: function(){
    //ground
    ctx.fillStyle = "#BF877B";
    ctx.fillRect(0,340,640,120);

    for(var i = 0; i < obstacles.length; i++){
      if(obstacles[i].type == "sonic-platform"){
        ctx.fillRect(obstacles[i].x - this.offset, obstacles[i].y - halfObstacleThick, obstacles[i].width, obstacleThick);
      }else if(obstacles[i].type = "coin"){
        ctx.drawImage(coinImg, obstacles[i].x - coinRadius/2 - this.offset, obstacles[i].y - coinRadius/2, coinRadius, coinRadius);
      }
    }

    ctx.fillStyle = "#B2EE31";
    ctx.fillRect(player.x - halfPlayerWidth - this.offset, player.y - halfPlayerWidth, playerWidth, playerWidth);
  }
}
function frameTick(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  airborne = true;

  player.move();
  camera.update();
  camera.draw();
  collisionDetection();

}

function collisionDetection(offset){
  for(var i = 0; i < obstacles.length; i++){
    if(obstacles[i].type == "sonic-platform"){
      //Check collisione
      if(player.y < obstacles[i].y - halfPlayerWidth &&
        player.y + player.speedY > obstacles[i].y - playerWidth &&
        player.x + player.speedX > obstacles[i].x + halfPlayerWidth&&
        player.x + player.speedX < obstacles[i].x + obstacles[i].width + halfPlayerWidth){
          player.y = obstacles[i].y - playerWidth;
          player.speedY = 0;
          airborne = false;
      }
      ctx.fillStyle = "000000";
    }

    else if(obstacles[i].type == "coin"){

      if(Math.sqrt(Math.pow(obstacles[i].x-player.x, 2) + Math.pow(obstacles[i].y-player.y, 2)) <= coinRadius){
        ctx.fillRect(0,0,640,10);
        obstacles.splice(i, 1);
        ctx.font = '50px serif';
        ctx.fillText("game over_", 100, 100, 200);

      }
    }
    //console.log(obstacles[i].x - offset + canvas.width/2)
  }
}

function gameOver(reset){
  if(reset == 1){
    console.log("game over");
    clearInterval(ticker);
    setTimeout(gameOver, 2000);
    ctx.font = '100px serif';
    ctx.fillText("hai perso", 100, 100, 500);
  }else{
    player.x = 120;
    player.y = 120;
    player.speedX = 0;
    player.speedY = 0;
    ticker = setInterval(frameTick, 23);
    console.log("game restarts");
  }
}

function keydown(e){
  if(e.which)
    var tasto = e.which;

  if(tasto == 32 || tasto == 38){
    player.jump();
    holdSpace = true;
    flappyAgain = false;
  }

  else if(tasto == 39){
    right = true;
    left = false;
  }else if(tasto == 37){
    left = true;
    right = false;
  }
}

function keyup(e){
  if(e.which)
    var tasto = e.which;
  if(tasto == 32 || tasto == 38){
    holdSpace = false;
    flappyAgain = true;
  }
  if(tasto == 39)
    right = false;
  if(tasto == 37)
    left = false;
}
