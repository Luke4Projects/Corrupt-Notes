class EvilNote {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sizeX = 50;
        this.sizeY = 50;
        this.ySpeed = 3;
        this.type = Math.floor(Math.random() * 3);
        this.corrupted = Math.random() < 0.7 ? true : false;

        this.rotation = this.corrupted ? Math.random() * Math.PI : 0;
    }
    draw() {
        let offset = this.corrupted ? Math.sin(Date.now()/100)*6 : 0;
        ctx.save();
        ctx.translate((this.x+this.sizeX/2)*SFN,(offset+this.y+this.sizeY/2)*SFN);
        ctx.rotate(this.rotation);
        ctx.drawImage(image.note, this.corrupted ? 3 : 43, this.type*40+3, 34, 34,(-this.sizeX/2)*SFN,(-this.sizeY/2)*SFN,Math.round(this.sizeX*SFN),Math.round(this.sizeY*SFN));
        ctx.restore();

        //ctx.strokeRect(this.x*SFN,this.y*SFN,this.sizeX*SFN,this.sizeY*SFN);
    }
    update() {
        if(guitarCombat == null) {
            this.y += gameSpeed;
        }
        if(this.y >= bounds.y) {
            if(this.corrupted) {
                effects.shakeScreen();
                sfx.hit.currentTime = 0;
                sfx.hit.play();
                corruption++;
            }
            evilNotes.splice(evilNotes.indexOf(this), 1);
        }
    }
}

class Particle {
    constructor(x,y, xSpeed, ySpeed, color, duration) {
        this.x = x;
        this.y = y;
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.radius = 4;
        this.tick = 0;
        this.duration = duration;
        this.color = color;
        this.moveWithGame = false;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x*SFN,this.y*SFN,this.radius*SFN,0,2*Math.PI,false);
        ctx.globalAlpha = (this.duration - this.tick)/this.duration;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    update() {
        this.x+=this.xSpeed;
        this.y+=this.ySpeed;
        if(this.moveWithGame) {
            this.y+=gameSpeed;
        }
        this.tick++;
        if(this.tick > this.duration) {
            particles.splice(particles.indexOf(this), 1);
        }
    }
}

class TempoChanger {
    constructor(y) {
        this.x = 250;
        this.y = y;
        this.height = 1000;
        this.offset = Math.floor(Math.random() * 4) + 2;
        this.frameX = 0;
        this.animationTick = 0;
    }
    draw() {
        ctx.drawImage(image.tempo_changer, this.frameX*25, 0, 25, 100, this.x*SFN, this.y*SFN, 250*SFN, this.height*SFN);
    }
    update() {
        if(guitarCombat == null) {
            this.y += gameSpeed;
            if(player.y < this.y+this.height && player.y + player.sizeY > this.y) {
                gameSpeed = normalGameSpeed+this.offset;
                sfx.song.playbackRate = this.offset;
            } else {
                sfx.song.playbackRate = 1;
                gameSpeed = normalGameSpeed;
            }
            if(this.y >= 1000) {
                tempoChanger = null;
            }
        }

        this.animationTick++;
        if(this.animationTick > 20) {
            this.frameX = (this.frameX + 1) % 4;
            this.animationTick = 0;
        }
    }
}

var player;
var guitarCombat;
var particles = [];

var evilNotes = [];
var spawnTick;

var tempoChanger;
var tempoChangerSpawntick;
var tempoChangerSpawntime;

var normalGameSpeed;
var gameSpeed;
var floorTimeOffset;

var corruption;
var noteSpawnTime;

function initGame() {
    player = new Player();
    spawnTick = 0;
    evilNotes = [];
    particles = [];
    guitarCombat = null;
    gameSpeed = 3;
    normalGameSpeed = gameSpeed;
    floorTimeOffset = 0;
    corruption = 0;
    noteSpawnTime = 250;
    tempoChanger = null;
    tempoChangerSpawntick = 0;
    tempoChangerSpawntime = Math.floor(Math.random() * 1500) + 1500;
    sfx.song.playbackRate = 1;
}

function spawnEvilNotes() {
    spawnTick++;
    if(spawnTick > noteSpawnTime) {
        let x = Math.random() < 0.5 ? Math.floor(Math.random() * 200) : Math.floor(Math.random() * 200) + 500;
        let note = new EvilNote(x, 0);
        evilNotes.push(note);
        spawnTick = 0;
    }
    if(Date.now() % 300 == 0) {
        noteSpawnTime-=5;
        //console.log("test");
    }
}

function spawnTempoChanger() {
    if(tempoChanger == null) {
        tempoChangerSpawntick++;
        if(tempoChangerSpawntick > tempoChangerSpawntime) {
            tempoChanger = new TempoChanger(-1000);
            tempoChangerSpawntick = 0;
            tempoChangerSpawntime = Math.floor(Math.random() * 1500) + 1500;
        }
    }
}

function drawFloor() {
    ctx.fillStyle = "#392945";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#2d1e2f";
    ctx.fillRect(0,0,250*SFN,1000*SFN);
    ctx.fillRect(500*SFN,0,250*SFN,1000*SFN);
    floorTimeOffset+= guitarCombat==null ? gameSpeed : 0;
    if(effects.screenShakeTick > 0) {
        ctx.translate(effects.shake.x, effects.shake.y);
    }
    for(let i = 0; i < 6; i++) {
        let y = ((i*200 + floorTimeOffset)%1200) - 200;
        ctx.fillStyle = "#241826";
        ctx.fillRect(0, y*SFN, 250*SFN, 70*SFN)
        ctx.fillRect(500*SFN, y*SFN, 250*SFN, 70*SFN)
        ctx.fillStyle = "#160f18ff";
        ctx.fillRect(0, (y+70)*SFN, 250*SFN, 30*SFN)
        ctx.fillRect(500*SFN, (y+70)*SFN, 250*SFN, 30*SFN)

        ctx.fillStyle = "#352144";
        ctx.fillRect(250*SFN, y*SFN, 250*SFN, 100*SFN);
    }
}

function corruptionBar() {
    ctx.fillStyle = "#2d1e2f";
    ctx.fillRect(275*SFN,0,200*SFN,50*SFN);
    ctx.strokeStyle = ctx.fillStyle = "#aad795";
    ctx.strokeRect(275*SFN,0,200*SFN,50*SFN);
    ctx.fillRect(275*SFN,0,(corruption/10)*200*SFN,50*SFN);

    ctx.fillStyle = "white";
    ctx.font = `${30*SFN}px Rocker`;
    ctx.fillText("CORRUPTION", 275*SFN, 35*SFN);
}

function showScore() {
    if(player.killTick < 150) {
        let size = (player.killTick < 50) ? player.killTick : 50;
        ctx.font = `${size*SFN}px Rocker`;
        ctx.fillText("+1", 430*SFN, 975*SFN);
    }
    ctx.font = `${30*SFN}px Rocker`;
    ctx.fillStyle = "white";
    ctx.fillText("PTS: " + player.score, 325*SFN, 970*SFN);
}