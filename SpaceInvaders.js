
function LoadImagePromise(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject("Could not load " + src);
        img.src = src;
    })
}

class SpaceInvaders {
    constructor(context, width, height) {
        // Constants
        this.width = 1000;
        this.height = 1000;
        this.maxlives = 3;
        this.maxhealth = 3;
        this.playerspeed = 8;
        this.leftlimit = 20;
        this.rightlimit = 980;
        this.uplimit = 20;
        this.downlimit = 980;
        this.shotlimit = 3;
        this.shotspeed = 10;
        this.fps = 30;
        this.imageData = [
            {name: 'player', src: 'assets/player.png', width: 90, height: 39},
            {name: 'shot', src: 'assets/shot.png', width: 4, height: 50},
        ];
        this.images = null;
        // Initialization
        this.context = context;
        this.keyupFunction = (evt) => this.onKeyup(evt);
        this.keydownFunction = (evt) => this.onKeydown(evt);
        // Canvas scaling
        this.context.scale(width/this.width, height/this.height)
    }
    load() {
        return new Promise((resolve, reject) => {
            if(this.images) {
                resolve();
            } else {
                Promise.all(this.imageData.map(img => LoadImagePromise(img.src))).then((imgArray) => {
                    this.images = (() => {
                        let result = new Map();
                        this.imageData.forEach((element, index) => {
                            result.set(this.imageData[index].name, {
                                img: imgArray[index],
                                width: this.imageData[index].width,
                                height: this.imageData[index].height
                            });
                        });
                        return result;
                    })();
                    resolve();
                }).catch((reason) => reject(reason));
            }
        });
    }
    start() {
        // Initialization
        this.controls = {left: false, right: false, shot: false};
        this.player = {
            x: this.width/2 - this.images.get('player').width/2,
            y: this.downlimit - this.images.get('player').height,
            speed: 0,
            lives: this.maxlives,
            health: this.maxhealth
        };
        this.shots = [];
        // Listeners + Interval
        document.addEventListener("keyup", this.keyupFunction);
        document.addEventListener("keydown", this.keydownFunction);
        this.intervalID = setInterval(() => this.gameLoop(), 1000/this.fps);
    }
    stop() {
        clearInterval(this.intervalID);
        document.removeEventListener("keydown", this.keydownFunction);
        document.removeEventListener("keyup", this.keyupFunction);
    }
    drawAsset(name, x, y) {
        let asset = this.images.get(name);
        this.context.drawImage(asset.img, x, y, asset.width, asset.height);
    }
    gameLoop() {
        // Draw
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);
        this.drawAsset('player', this.player.x, this.player.y);
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
            this.drawAsset('shot', element.x - 2, element.y - 8);
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
                    this.shots.push({
                        x: this.player.x + this.images.get('player').width/2,
                        y: this.player.y - this.images.get('shot').height
                    });
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
