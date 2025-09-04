const noteSequences = [
    "asdf",
    "fasd",
    "afsd",
    "adsf",
    "fafa",
    "asfa",
    "afad"
];

const rhythmSequences = [
    "1111",
    "1423",
    "1342",
    "1212",
    "1111",
    "1313",
    "1241",
];

const keyList = "asdf";

class GuitarCombat {
    constructor() {
        this.position = {x: 56, y:-200};
        this.scale = {x: 639, y:1500};
        this.animationOffset = {x: 0, y: 1000};
        this.startTick = 0;
        this.startAnimationSpeed = 20;
        this.notes = noteSequences[sequence];
        this.rhythm = rhythmSequences[sequence];
        sequence = (sequence + 1) % noteSequences.length;
        this.combatNotes = [];
        this.stringPositions = [0, 0, 0, 0];
        this.doneNotes = 0;
        this.lost = false;
        this.lostTick = 0;
        this.lostKey = null;
        this.noteSoundStart;
        this.sendSequence();
    }
    draw() {

        if(this.animationOffset.y > 0) {
            this.animationOffset.y-=this.startAnimationSpeed;
        }
        let yPos = (this.position.y+this.animationOffset.y) + Math.sin(Date.now()/100)*3;

        if(this.lostTick < 300) {
            ctx.drawImage(image.guitar, this.position.x*SFN, yPos*SFN, this.scale.x*SFN, this.scale.y*SFN);
        } else {
            if(this.lostTick % 200 > 50) {
                ctx.save();
                ctx.globalAlpha = 300/(this.lostTick);
                ctx.drawImage(image.guitar, this.position.x*SFN, this.position.y*SFN, this.scale.x*SFN, this.scale.y*SFN);
                ctx.restore();
            }
        }
        for(let i = 0; i < this.stringPositions.length; i++) {
            if(this.stringPositions[i] > 0) {
                this.stringPositions[i]-=0.05;
                ctx.save();
                ctx.globalAlpha = this.stringPositions[i];
                ctx.fillStyle = "#64b082";
                let xPos = this.position.x+275+(i*25)
                ctx.fillRect(xPos*SFN, 0, 14*SFN, 1000*SFN);
                ctx.restore();
            }
        }
        //ctx.drawImage(image.keys, (this.position.x+225)*SFN, (this.position.y+1000)*SFN, 190*SFN, 70*SFN);
        ctx.drawImage(image.keys, (this.position.x+260)*SFN, (this.position.y+1000)*SFN, 120*SFN, 70*SFN);
        if(this.lostKey != null) {
            if(this.lostTick % 200 > 50) {
                ctx.save();
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = "#a94b54";
                ctx.fillRect((this.position.x+260 + this.lostKey*29)*SFN, (this.position.y+1000)*SFN, 33*SFN, 70*SFN);
                ctx.restore();
            }
        }
        for(let i = 0; i < this.combatNotes.length; i++) {
            if(!this.combatNotes[i].done) {
                this.combatNotes[i].draw();
            }
        }
    }
    sendSequence() {
        let yPos = 0;
        for(let y = 0; y < this.notes.length; y++) {
            let pos;
            switch(this.notes[y]) {
                case 'a':
                    pos = 0;
                    break;
                case 's':
                    pos = 1;
                    break;
                case 'd':
                    pos = 2;
                    break;
                case 'f':
                    pos = 3;
                    break;
            }
            yPos += parseInt(this.rhythm[y])*100
            let note = new CombatNote(this.position.x+280+(pos*26), -yPos);
            this.combatNotes.push(note);
        }
    }
    checkKeyPress() {
        let goodKeyPress = false;
        for(let i = 0; i < this.combatNotes.length; i++) {
            if(!this.lost) {
                this.combatNotes[i].update();
            } else {
                sfx.notes.pause();
                if(sfx.fail.paused) {
                    sfx.fail.play();
                }
                this.combatNotes[i].pulse();
                this.lostTick++;
                if(this.lostTick > 800) {
                    this.endCombat();
                }
            }
            //this.stringPositions[keyList.indexOf(this.notes[i])] = false;
            if(this.combatNotes[i].passing && !this.lost) {
                let key = this.notes[i].toUpperCase();
                if(keys["Key" + key]) {
                    if(!this.combatNotes[i].done) {
                        this.noteSoundStart = keyList.indexOf(this.notes[i]);
                        if(i<this.combatNotes.length-1) {
                            sfx.notes.currentTime = this.noteSoundStart*2;
                            sfx.notes.play();
                        }
                        this.keyParticles((this.position.x+280 + this.noteSoundStart*26), this.position.y+1020);
                        this.doneNotes++;
                    }
                    this.combatNotes[i].done = true;
                    goodKeyPress = true;
                }
                for(let j = 0; j < keyList.length; j++) {
                    if(keyList[j] != this.notes[i]) {
                        if(keys["Key" + keyList[j].toUpperCase()]) {
                            goodKeyPress = false;
                        }
                    }
                }
                if(!this.combatNotes[i].done) {
                    this.stringPositions[keyList.indexOf(this.notes[i])] = 1
                }
            }
            if(this.combatNotes[i].passed && !this.combatNotes[i].done) {
                this.lost = true;
            }
        }
        if(!goodKeyPress && this.startTick > 150) {
            if(keys["KeyA"] || keys["KeyS"] || keys["KeyD"] || keys["KeyF"]) {
                if(keys["KeyA"]) {
                    this.lostKey = 0;
                }
                if(keys["KeyS"]) {
                    this.lostKey = 1;
                }
                if(keys["KeyD"]) {
                    this.lostKey = 2;
                }
                if(keys["KeyF"]) {
                    this.lostKey = 3;
                }
                this.lost = true;
            }
        }
    }
    update() {
        this.startTick++;
        this.checkKeyPress();
        if(this.doneNotes >= this.combatNotes.length) {
            player.successfulAttack();
            sfx.success.play();
            this.endCombat();
        }
    }
    endCombat() {
        sfx.notes.pause();
        player.combatEndTick = 0;
        guitarCombat = null;
    }
    keyParticles(x,y) {
        for(let i = 0; i < Math.PI*2; i+=0.5) {
            let p = new Particle(x,y,Math.cos(i)*Math.random(),Math.sin(i)*Math.random(), "#fcecd1", 100);
            particles.push(p);
        }
    }
}

class CombatNote {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.ySpeed = 3;
        this.passing = false;
        this.passed = false;
        this.done = false;
    }
    draw() {
        ctx.save();
        ctx.fillStyle = this.passed ? "#ff0019ff" : "#fff8ebff";
        ctx.shadowColor = "#fff8ebff"; 
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x*SFN,this.y*SFN,this.radius*SFN,0,2*Math.PI,false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    update() {
        this.y+=this.ySpeed;
        if(this.y >= 800) {
            this.passing = true;
            if(this.y >= 870) {
                this.passed = true;
                this.pasing = false;
            }
        }
    }
    pulse() {
        let pulseAmount = Math.sin(Date.now()/40)*0.5;
        if(this.radius > Math.abs(pulseAmount)) {
            this.radius += pulseAmount;
        }
    }
}