class Player {
    constructor() {
        this.sizeX = 13*5;
        this.sizeY = 26*5;
        this.x = bounds.x/2 - this.sizeX/2;
        this.y = 800;

        this.guitarX = this.x+this.sizeX/2;
        this.guitarY = this.y+30;

        this.aimSpeed = 0.005;
        this.aimVelocity = 0;
        this.aimFriction = 0.8;
        this.attackAngle = 0;

        this.bullets = [];
        this.guitarAnimationTick = 0;
        this.combatEndTick = 500;
        this.killTick = 500;

        this.frameX = 0;
        this.animationTick = 0;

        this.gameOverTick = 0;

        this.score = 0;
    }
    draw() {
        this.drawGuitar();
        
        this.animationTick++;
        if(this.animationTick > 10) {
            this.frameX = (this.frameX + 1) % 4;
            this.animationTick = 0;
        }
        ctx.drawImage(image.player, this.frameX*13, 0, 13, 26, this.x*SFN,this.y*SFN,this.sizeX*SFN,this.sizeY*SFN);

        for(let bullet of this.bullets) {
            bullet.draw();
        }
    }
    drawGuitar() {

        ctx.save();
        ctx.setLineDash([30*SFN]);
        ctx.strokeStyle = "#fcecd1";
        ctx.beginPath();
        ctx.moveTo(this.guitarX*SFN, this.guitarY*SFN);
        ctx.lineTo((this.guitarX+Math.cos(this.attackAngle-Math.PI/2)*800)*SFN, (this.guitarY+Math.sin(this.attackAngle-Math.PI/2)*800)*SFN);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        if(this.guitarAnimationTick > 0) {
            this.guitarAnimationTick++;
            if(this.guitarAnimationTick > Math.PI*15) {
                this.guitarAnimationTick = 0;
            }
        }
        let animationAmount = Math.sin(this.guitarAnimationTick/15)*50;
        let animationOffsetX = -Math.cos(this.attackAngle-Math.PI/2)*animationAmount;
        let animationOffsetY = -Math.sin(this.attackAngle-Math.PI/2)*animationAmount;
        ctx.save();
        ctx.translate((this.guitarX + animationOffsetX)*SFN,(this.guitarY+animationOffsetY)*SFN);
        ctx.rotate(this.attackAngle);
        ctx.drawImage(image.guitar, -24*SFN, -100*SFN, 49*SFN,115*SFN);
        ctx.restore();
    }
    update() {
        this.updateInput();
        this.attackAngle+=this.aimVelocity;
        this.aimVelocity*=this.aimFriction;
        if(guitarCombat == null) {
            this.combatEndTick++;
        }
        this.killTick++;
        for(let bullet of this.bullets) {
            bullet.update();
        }
    }
    updateInput() {
        if(guitarCombat == null && this.guitarAnimationTick == 0) {
            if(keys["KeyA"] || keys["KeyS"]) {
                this.aimVelocity-=this.aimSpeed;
            }
            if(keys["KeyF"] || keys["KeyD"]) {
                this.aimVelocity+=this.aimSpeed;
            }
        }
        if(keys["Space"] && guitarCombat == null) {
            guitarCombat = new GuitarCombat();
        }
        //if(keys["Space"]) {
        //    this.successfulAttack();
        //} 
    }
    successfulAttack() {
        for(let i = 0; i < 3; i++) {
            let xdir = Math.cos(this.attackAngle-Math.PI/2);
            let ydir = Math.sin(this.attackAngle-Math.PI/2);
            let bullet = new Bullet(this.guitarX + (xdir*i*25), this.guitarY+(ydir*i*25), xdir*10, ydir*10);
            this.bullets.push(bullet);
        }
        this.guitarAnimationTick = 1;
    }
}

class Bullet {
    constructor(x,y,xSpeed,ySpeed){
        this.x=x;
        this.y=y;
        this.radius = 10;
        this.xSpeed=xSpeed;
        this.ySpeed=ySpeed;
    }
    draw() {
        ctx.fillStyle = "#fcecd1";
        ctx.beginPath();
        ctx.arc(this.x*SFN,this.y*SFN,this.radius*SFN,0,2*Math.PI,false);
        ctx.fill();
        ctx.closePath();
    }
    update() {
        this.x+=this.xSpeed;
        this.y+=this.ySpeed;
        for(let i = 0; i < evilNotes.length; i++) {
            if(evilNotes[i].x + evilNotes[i].sizeX > this.x-this.radius && evilNotes[i].x < this.x+this.radius*2) {
                if(evilNotes[i].y + evilNotes[i].sizeY > this.y-this.radius && evilNotes[i].y < this.y+this.radius*2) {
                    for(let i = 0; i < Math.PI*2; i+=0.5) {
                        let p = new Particle(this.x,this.y, Math.cos(i)*Math.random(), Math.sin(i)*Math.random(), "#aad795", 100);
                        p.moveWithGame = true;
                        particles.push(p);
                    }
                    if(evilNotes[i].corrupted) { 
                        player.killTick = 0;
                        player.score++;
                    }
                    evilNotes.splice(i,1);
                }
            }
        }
    }
}
