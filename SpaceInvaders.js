
function LoadImagePromise(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject("Could not load " + src);
        img.src = src;
    })
}

class SpaceInvaders {
    static constants() {
        var playerspeed = 8;
    }
    constructor(context, fps=30) {
        // Constants
        this.width = 400;
        this.height = 400;
        this.maxhealth = 3;
        this.playerspeed = 8;
        this.leftlimit = 30;
        this.rightlimit = 370;
        this.uplimit = 30;
        this.shotlimit = 3;
        this.shotspeed = 10;
        this.imageNames = [
            "player",
            "shot",
        ];
        this.imageURLs = this.imageNames.map(img => ("assets/" + img + ".png"));
        this.images = null;
        // Initialization
        this.context = context;
        this.fps = fps;
        this.keyupFunction = (evt) => this.onKeyup(evt);
        this.keydownFunction = (evt) => this.onKeydown(evt);
        this.controls = {left: false, right: false, shot: false};
        this.player = {x: 200, y: 320, speed: 0, lives: 3, health: this.maxhealth};
        this.shots = [];
    }
    load() {
        return new Promise((resolve, reject) => {
            if(this.images) {
                resolve();
            } else {
                Promise.all(this.imageURLs.map(img => LoadImagePromise(img))).then((imgArray) => {
                    this.images = (() => {
                        let result = new Map();
                        this.imageNames.forEach((element, index) => {
                            result.set(this.imageNames[index], imgArray[index]);
                        });
                        return result;
                    })();
                    resolve();
                }).catch((reason) => reject(reason));
            }
        });
    }
    start() {
        document.addEventListener("keyup", this.keyupFunction);
        document.addEventListener("keydown", this.keydownFunction);
        this.intervalID = setInterval(() => this.gameLoop(), 1000/this.fps);
    }
    stop() {
        clearInterval(this.intervalID);
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }
    gameLoop() {
        // Draw
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.drawImage(this.images.get('player'), this.player.x - 20, this.player.y - 10);
        // Player movement
        let nextPosition = this.player.x + this.player.speed
        if(nextPosition > this.leftlimit && nextPosition < this.rightlimit) {
            this.player.x = nextPosition;
        }
        // Player shots
        this.shots.forEach((element) => {
            element.y -= this.shotspeed;
        });
        while(this.shots.length > 0 && this.shots[0].y <= this.uplimit) {
            this.shots.shift();
        }
        this.shots.forEach((element) => {
            this.context.drawImage(this.images.get('shot'), element.x - 2, element.y - 8);
        });
    }
    onKeyup(evt) {
        switch(evt.keyCode) {
            case 13:
                // Return
                break;
            case 32:
                // Space
                this.controls.shot = false;
                break;
            case 37:
                // Left
                this.controls.left = false;
                if(this.controls.right) {
                    this.player.speed = this.playerspeed;
                } else {
                    this.player.speed = 0;
                }
                break;
            case 38:
                // Up
                break;
            case 39:
                // Right
                this.controls.right = false;
                if(this.controls.left) {
                    this.player.speed = -this.playerspeed;
                } else {
                    this.player.speed = 0;
                }
                break;
            case 40:
                // Down
                break;
        }
    }
    onKeydown(evt) {
        switch(evt.keyCode) {
            case 13:
                // Return
                break;
            case 32:
                // Space
                if(!this.controls.shot && this.shots.length < this.shotlimit) {
                    this.shots.push({x: this.player.x, y: this.player.y});
                    this.controls.shot = true;
                }
                break;
            case 37:
                // Left
                this.controls.left = true;
                this.player.speed = -this.playerspeed;
                break;
            case 38:
                // Up
                break;
            case 39:
                // Right
                this.controls.right = true;
                this.player.speed = this.playerspeed;
                break;
            case 40:
                // Down
                break;
        }
    }
}
