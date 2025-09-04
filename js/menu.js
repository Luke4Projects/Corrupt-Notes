class Effects {
    constructor() {
        this.screenShakeTick = 0;
        this.shake = {x: 0, y: 0};
    }
    update() {
        if(this.screenShakeTick > 0) {
            this.screenShakeTick++;
            this.shake.x = Math.sin(this.screenShakeTick)*10
            this.shake.y = Math.cos(this.screenShakeTick)*10
            if(this.screenShakeTick > 30) {
                this.screenShakeTick = 0;
            }
        }
    }
    shakeScreen() {
        this.screenShakeTick = 1;
    }
}

function startMenu() {
    ctx.fillStyle = "blue";
    //ctx.fillRect(200*SFN, 250*SFN, 405*SFN, 10*SFN);
    ctx.fillStyle = "white";
    ctx.font = `${30*SFN}px Rocker`;
    ctx.fillText("CORRUPTED MUSIC NOTES ARE TAKING OVER!", 35*SFN, 300*SFN);
    ctx.fillText("DESTROY THEM WITH YOUR GUITAR", 105*SFN, 350*SFN);
    ctx.fillText("USE 'A','S','D','F' TO AIM/PLAY", 173*SFN, 400*SFN);
    ctx.fillText("USE 'SPACE' TO SHOOT", 213*SFN, 450*SFN);
    if(!document.hasFocus()) {
        focusScreen();
    }
}

function gameOver() {
    evilNotes = [];

    ctx.fillStyle = "white";
    ctx.font = `${30*SFN}px Rocker`;

    ctx.fillText("TOO MANY CORRUPTED NOTES GOT THROUGH", 35*SFN, 300*SFN);
    ctx.fillText("SCORE: " + player.score, 305*SFN, 350*SFN);
    ctx.fillText("PRESS ANY KEY TO TRY AGAIN", 138*SFN, 400*SFN);
    if(!document.hasFocus()) {
        focusScreen();
    }

    player.gameOverTick++;

}

function focusScreen() {
    ctx.font = `${40*SFN}px Rocker`;
    ctx.fillStyle = "white";
    ctx.fillText("CLICK TO FOCUS GAME", 155*SFN, 240*SFN);
}