/** @type{HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d")

var SFN; // scale fit native
const bounds = {
    x: 750,
    y: 1000
};

var gameStates = {
    0: "menu",
    1: "playing",
    2: "dead"
};
var gameState = 0;

var keys = {};

var sequence;

var image = {
    guitar: new Image(),
    keys: new Image(),
    player: new Image(),
    note: new Image(),
    guitar_small: new Image(),
    tempo_changer: new Image(),
    load: function() {
        this.guitar.src = "data/guitar.png";
        this.keys.src = "data/keys.png";
        this.player.src = "data/player.png";
        this.note.src = "data/note.png";
        this.guitar_small.src = "data/guitar_small.png";
        this.tempo_changer.src = "data/tempo_changer.png";
    }
}

var sfx = {
    notes: new Audio(),
    fail: new Audio(),
    success: new Audio(),
    hit: new Audio(),
    song: new Audio(),
    load: function() {
        this.notes.src = "data/notes.wav";
        this.fail.src = "data/fail.wav";
        this.success.src = "data/success.wav";
        this.hit.src = "data/hit.wav";
        this.song.src = "data/song.wav";
        this.song.volume = 0.5;
    },
    update: function() {
        if(this.song.currentTime >= 6.8) {
            this.song.currentTime = 0;
        }
    }
}

var effects;

function start() {
    canvasResize();
    image.load();
    sfx.load();
    effects = new Effects();
    sequence = 0;
    initGame();
    update();
}

function update() {
    if(gameStates[gameState] == "playing") {
        if(guitarCombat != null) {
            guitarCombat.update();
        } else {
            spawnEvilNotes();
            spawnTempoChanger();
        }
        for(let note of evilNotes) {
            note.update();
        }
        for(let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        if(tempoChanger != null) {
            tempoChanger.update();
        }
        player.update();
        if(corruption >= 10) {
            gameState = 2;
        }
    }
    effects.update();
    sfx.update();
    draw();
    requestAnimationFrame(update);
}

function draw() {
    drawFloor();
    if(tempoChanger != null) {
        tempoChanger.draw();
    }
    player.draw();
    for(let note of evilNotes) {
        note.draw();
    }
    if(guitarCombat != null) {
        guitarCombat.draw();
    }
    for(let particle of particles) {
        particle.draw();
    }
    if(gameStates[gameState] == "menu") {
        startMenu();
    }
    if(gameStates[gameState] == "dead") {
        gameOver();
    }
    ctx.resetTransform();
    corruptionBar();
    showScore();
}

function canvasResize() {
    if(window.innerHeight*0.75 < window.innerWidth) {
        canvas.height = window.innerHeight*0.95;
        canvas.width = canvas.height*0.75;
    } else {
        canvas.width = window.innerWidth*0.95;
        canvas.height = canvas.width*(4/3);
    }
    SFN = Math.min(canvas.width, canvas.height)/750;
    ctx.imageSmoothingEnabled=false;
}

function keyDown(e) {
    keys[e.code] = true;
    if(gameStates[gameState] == "menu") {
        gameState = 1;
    }
    if(gameStates[gameState] == "dead" && player.gameOverTick > 200) {
        initGame();
        gameState = 1;
    }
    if(sfx.song.paused) {
        sfx.song.play();
    }
}
function keyUp(e) {
    keys[e.code] = false;
}

document.body.onload = start;
document.body.onresize = canvasResize;
document.onkeydown = keyDown;
document.onkeyup = keyUp