
class SpaceInvaders {
    constructor(context, width, height, eventsrc=document) {
        // Constants
        this.eventsrc = eventsrc ? eventsrc : document;
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
        this.ufospeed = 4;
        this.invaderdown = 8;
        this.fps = 30;
        this.imageData = [
            {name: 'player', src: 'assets/player.png', width: 90, height: 40},
            {name: 'shot', src: 'assets/shot.png', width: 6, height: 50},
            {name: 'invader1', src: 'assets/invader1.png', width: 80, height: 50},
            {name: 'invader2', src: 'assets/invader2.png', width: 80, height: 70},
            {name: 'invader3', src: 'assets/invader3.png', width: 80, height: 60},
            {name: 'ufo', src: 'assets/ufo.png', width: 90, height: 40},
        ];
        // Initialization
        this.context = context;
        this.keyupFunction = (evt) => this.onKeyup(evt);
        this.keydownFunction = (evt) => this.onKeydown(evt);
        // Context
        this.context.scale(width/this.width, height/this.height)
    }
    load() {
        return new Promise((resolve, reject) => {
            if(this.images) {
                resolve();
            } else {
                Promise.all(this.imageData.map(image => new Promise((resolve, reject) => {
                        let img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = () => reject(`Could not load ${image.src}`);
                        img.src = image.src;
                })))
                .then((imgArray) => {
                    this.images = (() => {
                        let result = new Map();
                        imgArray.forEach((element) => {
                            let imgData = this.imageData.find((e) => element.src.endsWith(e.src));
                            result.set(imgData.name, {
                                img: element,
                                width: imgData.width,
                                height: imgData.height
                            });
                        });
                        return result;
                    })();
                    resolve();
                })
                .catch((reason) => reject(reason));
            }
        });
    }
    initialInvaders() {
        const columns = 8;
        const leftmargin = this.leftlimit;
        const topmargin = 200;
        let invaders = [];
        for(let x = 0; x < columns; x++) {
            for(let y = 0; y < 1; y++) {
                invaders.push({
                    type: 'invader3',
                    points: 3,
                    x: leftmargin + this.images.get('invader3').width*1.3*x,
                    y: topmargin + this.images.get('invader3').height*1.3*y
                });
            }
            for(let y = 0; y < 2; y++) {
                invaders.push({
                    type: 'invader2',
                    points: 2,
                    x: leftmargin + this.images.get('invader2').width*1.3*x,
                    y: this.images.get('invader3').height*1.3 
                        + topmargin + this.images.get('invader2').height*1.3*y
                });
            }
            for(let y = 0; y < 2; y++) {
                invaders.push({
                    type: 'invader1',
                    points: 1,
                    x: leftmargin + this.images.get('invader1').width*1.3*x,
                    y: 2*this.images.get('invader2').height*1.3 
                        + this.images.get('invader3').height*1.3
                        + topmargin + this.images.get('invader1').height*1.3*y
                });
            }
        }
        return invaders;
    }
    init() {
        this.controls = {pause: false, left: false, right: false, shot: false};
        this.player = {
            x: this.width/2 - this.images.get('player').width/2,
            y: this.downlimit - this.images.get('player').height,
            speed: 0,
            score: 0,
            lives: this.maxlives,
            health: this.maxhealth
        };
        this.invaders = this.initialInvaders();
        this.invaderspeed = 1;
        this.shots = [];
        this.frame = 0;
        this.paused = false;
        this.resumed = false;
        this.eventsrc.addEventListener('focus', ()=>{if(!this.resumed){this.resume()}});
        this.eventsrc.addEventListener('blur', ()=>{if(this.resumed){this.pause()}});
    }
    resume() {
        this.resumed = true;
        this.eventsrc.addEventListener('keyup', this.keyupFunction);
        this.eventsrc.addEventListener('keydown', this.keydownFunction);
        this.intervalID = setInterval(() => this.gameLoop(), 1000/this.fps);
    }
    pause() {
        this.resumed = false;
        clearInterval(this.intervalID);
        this.eventsrc.removeEventListener('keydown', this.keydownFunction);
        this.eventsrc.removeEventListener('keyup', this.keyupFunction);
    }
    start() {
        this.init();
        if(this.eventsrc === document) {
            this.resume();
        } else {
            this.gameLoop(); // Render first frame of the game
        }
    }
    focus() {
        if(this.eventsrc.focus) {
            this.eventsrc.focus();
        }
    }
    drawAsset(name, x, y) {
        let asset = this.images.get(name);
        this.context.drawImage(asset.img, x, y, asset.width, asset.height);
    }
    leftmostInvader() {
        let result;
        this.invaders.forEach((element) => {
            if(!result || element.x < result.x) {
                result = element;
            }
        });
        return result;
    }
    rightmostInvader() {
        let result;
        this.invaders.forEach((element) => {
            if(!result || element.x > result.x) {
                result = element;
            }
        });
        return result;
    }
    gameLoop() {
        if(this.paused) {
            const pausex = 340;
            const pausey = this.height/2;
            this.context.font = '80px Arial';
            this.context.fillStyle = 'black';
            this.context.fillText('PAUSED', pausex - 5, pausey - 5);
            this.context.fillText('PAUSED', pausex - 5, pausey + 5);
            this.context.fillText('PAUSED', pausex + 5, pausey - 5);
            this.context.fillText('PAUSED', pausex + 5, pausey + 5);
            this.context.fillStyle = 'white';
            this.context.fillText('PAUSED', pausex, pausey);
        } else {
            // Background
            this.context.fillStyle = 'black';
            this.context.fillRect(0, 0, this.width, this.height);
            // Player
            this.drawAsset('player', this.player.x, this.player.y);
            let nextPosition = this.player.x + this.player.speed
            if(nextPosition > this.leftlimit && nextPosition + this.images.get('player').width < this.rightlimit) {
                this.player.x = nextPosition;
            }
            // Invaders
            this.invaders.forEach((invader) => {
                this.drawAsset(invader.type, invader.x, invader.y);
                invader.x += this.invaderspeed;
            });
            let changedDirection = true;
            if(this.rightmostInvader().x + this.images.get('invader1').width >= this.rightlimit) {
                this.invaderspeed = -(Math.abs(this.invaderspeed) + .1);
            } else if(this.leftmostInvader().x <= this.leftlimit) {
                this.invaderspeed = (Math.abs(this.invaderspeed) + .1);
            } else {
                changedDirection = false;
            }
            if(changedDirection) {
                this.invaders.forEach((invader) => {
                    invader.y += this.invaderdown;
                });
            }
            // Player shots
            this.shots.forEach((element) => {
                element.y -= this.shotspeed;
            });
            while(this.shots.length > 0 && this.shots[0].y <= this.uplimit) {
                this.shots.shift();
            }
            this.shots.forEach((element) => {
                this.drawAsset('shot', element.x, element.y);
            });
            // Increment frame counter
            this.frame++;
        }
    }
    onKeyup(evt) {
        switch(evt.keyCode) {
            case 13:
                // Return
                this.controls.pause = false;
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
                if(!this.controls.pause) {
                    this.paused = !this.paused;
                    this.controls.pause = true;
                }
                break;
            case 32:
                // Space
                if(!this.paused && !this.controls.shot && this.shots.length < this.shotlimit) {
                    this.shots.push({
                        x: this.player.x + this.images.get('player').width/2 - this.images.get('shot').width/2,
                        y: this.player.y - this.images.get('shot').height*.8
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
