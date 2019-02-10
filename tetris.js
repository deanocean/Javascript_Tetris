const cvs = document.getElementById('tetris');
const ctx = cvs.getContext("2d");

const ROW = 20; //20行
const COL = 10; //10列
const SQ = 20; //方塊大小
const VACANT = "white"; //空格顏色

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
let score = 0;
let level = 1;
let secs = 500;

// 畫格子
function drawSquare(x,y,color){
        ctx.fillStyle = color;
        ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
        ctx.strokeStyle = "black";
        ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

//建立面板
//create the board
let board = [];
for( r=0; r<ROW; r++){
    board[r] = [];
    for( c=0; c<COL; c++){
        board[r][c] = VACANT;
        // console.log(`board[${r}][${c}]`);
    }
}

//draw the board
function drawBoard(){
    for( r=0; r<ROW; r++){
        for( c=0; c<COL; c++){
            drawSquare(c, r, board[r][c]);
        }
    }
}
drawBoard();


//建立方塊陣列
const PIECES = [
    [I,"red"],
    [O,"orange"],
    [T,"yellow"],
    [J,"green"],
    [L,"cyan"],
    [S,"blue"],
    [Z,"purple"]
];

// 方塊物件函式
function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetroNum = Math.floor(Math.random() * this.tetromino.length); //隨機0~3號圖樣
    this.activeTetro = this.tetromino[this.tetroNum]; //當下使用的圖樣

    //圖樣的x和y軸位置
    this.x = 3;
    this.y = -2;
}

//隨機生出方塊
function randomPiece(){
    let rand = Math.floor(Math.random() * PIECES.length); // 0 ~ 6
    return new Piece(PIECES[rand][0], PIECES[rand][1]);
}

// 建立方塊物件
let p = randomPiece();

// 畫方塊
Piece.prototype.fill = function(color){
    for(r=0; r<this.activeTetro.length; r++){
        for(c=0; c<this.activeTetro.length; c++){
            if(this.activeTetro[r][c]){ //occupied
                drawSquare(this.x+c, this.y+r, color);
            }
        }
    }
}

Piece.prototype.draw = function(){
    this.fill(this.color);
}

//undraw previous piece
Piece.prototype.undraw = function(){
    this.fill(VACANT);
}



// move down the piece
Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetro)){
        this.undraw();
        this.y++;
        this.draw();
    }else{ //鎖住這一方塊並生出新的方塊
        this.lock();
        p = randomPiece();
    }
}

// move right
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetro)){
        this.undraw();
        this.x++;
        this.draw();
    }
}

// move left
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetro)){
        this.undraw();
        this.x--;
        this.draw();
    }
}

// rotate
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetroNum + 1) % this.tetromino.length];
    let kick = 0;

    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){ //右邊的牆
            kick = -1;
        }else{
            kick = 1;
        }
    }

    if(!this.collision(kick,0,nextPattern)){ 
        this.undraw();
        this.x += kick;
        this.tetroNum = (this.tetroNum+1) % this.tetromino.length;
        this.activeTetro = this.tetromino[this.tetroNum];
        this.draw();
    }else{

    }
}

// 控制方塊
document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
        dropStart = Date.now();
    }
}

// 判斷是否撞牆
Piece.prototype.collision = function(x, y, piece){
    for(r=0; r<piece.length; r++){
        for(c=0; c<piece.length; c++){
            if(!piece[r][c]){ //空白的
                continue;
            }

            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if(newX < 0 || newX >= COL || newY >= ROW){ //左邊的牆、右邊的牆、底部
                return true;
            }
            
            if(newY < 0){ //會遊戲崩潰
                continue;
            }
            
            if(board[newY][newX] != VACANT){ //如果那一格已經有其他方塊
                return true;
            }
        }
    }
    return false;
}


// 鎖住
Piece.prototype.lock = function(){
    for(r=0; r<this.activeTetro.length; r++){
        for(c=0; c<this.activeTetro.length; c++){
            if(!this.activeTetro[r][c]){ //skip vanant square
                continue;
            }
            // 到最上層時遊戲結束
            if( this.y + r < 0 ){
                alert("Game Over");
                //停止落下動畫
                gameOver = true;
                break;
            }
            // lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // 消除行，判斷每一行當中有那些已經滿行了
    for(r=0; r<ROW; r++){
        let isRowFull = true;
        for(c=0; c<COL; c++){
            isRowFull = isRowFull && board[r][c] != VACANT; 
            //一行中的每一格都要被佔據才會消掉，isRowFull是上一格判斷的結果，帶到下一格做判斷，如果isRowFull已經是false了，代表這格之前有空格，這一行就不會被消掉，這行跑完後結果出來會是false
        }
        if(isRowFull){ //如果那行被占滿
            for(y=r; y>0; y--){
                for(c=0; c<COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            for(c=0; c<COL; c++){
                board[0][c] = VACANT;
            }
            //increase the score
            score += 10;

            //update the score
            scoreElement.innerHTML = score;
            if(score/50 > 1){
                level = Math.ceil(score/50);
                levelElement.innerHTML = level;
                secs = 500 / level;
                console.log(secs);
            }
        }
    }
    drawBoard();
}

//每秒掉下一格
let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > secs){
        p.moveDown();
        dropStart = Date.now();
    }
    if(!gameOver){
        requestAnimationFrame(drop);
    }
}
drop();


