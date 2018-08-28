class SpaceInvaders {
    constructor(context, width, height, eventsrc=document) {
        // Configuration
        this.eventsrc = eventsrc ? eventsrc : document;
        this.width = 1000;
        this.height = 1000;
        this.maxlives = 3;
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
        this.animationPeriod = this.fps * .6;
        this.deathAnimationPeriod = this.fps * 0.05;
        this.deathAnimationFrames = 12;
        this.deathAnimationPoints = {
            initialPosition: {
                x: 0,
                y: 0
            },
            frameDelta: {
                x: 0,
                y: -1
            }
        }
        this.invaderdownlimit = 920;
        this.invaderinitialspeed = 1;
        this.invaderspeedincrease = {
            death: .05,
            level: 1,
        }
        this.keybindings = {
            left: 37, // Left Arrow
            right: 39, // Right Arrow
            shoot: 32, // Space
            pause: 13, // Return
        }
        this.assetsRoot = 'assets/';
        this.imageData = [
            {name: 'player', srcs: ['player.png'], width: 90, height: 40},
            {name: 'shot', srcs: ['shot.png'], width: 6, height: 50},
            {name: 'invader1', srcs: ['invader1_0.png', 'invader1_1.png'], width: 80, height: 50},
            {name: 'invader2', srcs: ['invader2_0.png', 'invader2_1.png'], width: 80, height: 70},
            {name: 'invader3', srcs: ['invader3_0.png', 'invader3_1.png'], width: 80, height: 60},
            {name: 'ufo', srcs: ['ufo_0.png', 'ufo_1.png'], width: 90, height: 40},
            {name: 'death', srcs: ['death1.png', 'death2.png', 'death3.png'], width: 60, height: 60},
        ];
        // Initialization
        this.context = context;
        this.frame = 0;
        this.state = 0;
        this.enabled = false;
        this.keyupFunction = (evt) => this.onKeyup(evt);
        this.keydownFunction = (evt) => this.onKeydown(evt);
        this.eventsrc.addEventListener('focus', ()=>{this.enable()});
        this.eventsrc.addEventListener('blur', ()=>{this.disable()});
        this.context.scale(width/this.width, height/this.height)
    }
    load(assetsRoot=this.assetsRoot) {
        return new Promise((resolve, reject) => {
            if(this.images) {
                resolve();
            } else {
                Promise.all(this.imageData.map(data => Promise.all(data.srcs.map(file => new Promise((resolve, reject) => {
                    let src = assetsRoot + file;
                    let img = new Image();
                    img.onload = () => resolve({name: data.name, img: img});
                    img.onerror = () => reject(`Could not load ${src}`);
                    img.src = src;
                })))))
                .then((loadedAssets) => {
                    this.images = (() => {
                        let result = new Map();
                        this.imageData.forEach((element) => {
                            result.set(element.name, {
                                imgs: [],
                                width: element.width,
                                height: element.height
                            });
                        });
                        return result;
                    })();
                    loadedAssets.forEach((asset) => {
                        asset.forEach((image) => {
                            this.images.get(image.name).imgs.push(image.img);
                        });
                    });
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
                    asset: 'invader3',
                    animationCounter: 1,
                    points: 80,
                    x: leftmargin + this.images.get('invader3').width*1.3*x,
                    y: topmargin + this.images.get('invader3').height*1.3*y
                });
            }
            for(let y = 0; y < 2; y++) {
                invaders.push({
                    asset: 'invader2',
                    animationCounter: 1,
                    points: 60,
                    x: leftmargin + this.images.get('invader2').width*1.3*x,
                    y: this.images.get('invader3').height*1.3 
                        + topmargin + this.images.get('invader2').height*1.3*y
                });
            }
            for(let y = 0; y < 2; y++) {
                invaders.push({
                    asset: 'invader1',
                    animationCounter: 1,
                    points: 50,
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
        this.controls = { pause: false, left: false, right: false, shot: false };
        this.player = {
            x: this.width/2 - this.images.get('player').width/2,
            y: this.downlimit - this.images.get('player').height,
            speed: 0,
            score: 0,
            lives: this.maxlives
        };
        this.invaders = this.initialInvaders();
        this.deathAnimations = [];
        this.shots = [];
        this.invaderspeed = this.invaderinitialspeed;
        this.level = 0;
    }
    enable() {
        if(!this.enabled) {
            this.enabled = true;
            this.eventsrc.addEventListener('keyup', this.keyupFunction);
            this.eventsrc.addEventListener('keydown', this.keydownFunction);
            this.intervalID = setInterval(() => this.render(), 1000/this.fps);
        }
    }
    disable() {
        if(this.enabled) {
            this.enabled = false;
            clearInterval(this.intervalID);
            this.eventsrc.removeEventListener('keydown', this.keydownFunction);
            this.eventsrc.removeEventListener('keyup', this.keyupFunction);
        }
    }
    start() {
        this.init();
        if(this.eventsrc === document) {
            this.enable();
        } else {
            this.render(); // Render first frame
        }
    }
    focus() {
        if(this.eventsrc.focus) {
            this.eventsrc.focus();
        }
    }
    drawAsset(name, x, y, imageIndex=0) {
        let asset = this.images.get(name);
        this.context.drawImage(asset.imgs[imageIndex], x, y, asset.width, asset.height);
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
    isOverlap1D(p00, p01, p10, p11) {
        return (p00 < p10 && p01 > p10) || (p10 < p00 && p11 > p00);
    }
    isOverlap2D(object1, object2) {
        const img1 = this.images.get(object1.asset);
        const img2 = this.images.get(object2.asset);
        return this.isOverlap1D(object1.x, object1.x + img1.width, object2.x, object2.x + img2.width)
            && this.isOverlap1D(object1.y, object1.y + img1.height, object2.y, object2.y + img2.height);
    }
    nextFrame() {
        // Player shots
        {
            let shotIndicesToDelete = [];
            this.shots.forEach((element, index) => {
                element.y -= this.shotspeed;
                if(element.y <= this.uplimit) {
                    shotIndicesToDelete.push(index);
                }
            });
            shotIndicesToDelete.sort((a,b) => b-a).forEach((i) => {
                this.shots.splice(i, 1);
            });
        }
        // Player
        {
            let nextPosition = this.player.x + this.player.speed
            if(nextPosition > this.leftlimit && nextPosition + this.images.get('player').width < this.rightlimit) {
                this.player.x = nextPosition;
            }
        }
        // Invaders
        {
            let invaderIndicesToDelete = []; 
            this.invaders.forEach((invader, invaderIndex) => {
                let shotIndex = (() => {
                    for(let i in this.shots) {
                        if(this.isOverlap2D(this.shots[i], invader)) {
                            return i;
                        }
                    }
                    return null;
                })();
                if(shotIndex) {
                    this.shots.splice(shotIndex, 1);
                    invaderIndicesToDelete.push(invaderIndex);
                } else {
                    if(invader.y + this.images.get(invader.asset).height > this.invaderdownlimit) {
                        this.state = 2;
                    }
                    if(this.frame % this.animationPeriod === 0) {
                        invader.animationCounter = (invader.animationCounter + 1) % 2;
                    }
                    invader.x += this.invaderspeed;
                }
            });
            invaderIndicesToDelete.sort((a,b) => b-a).forEach((i) => {
                const invader = this.invaders[i];
                const points = invader.points * (this.level + 1);
                this.player.score += points;
                this.deathAnimations.push({
                    x: invader.x - ((this.images.get('death').width - this.images.get(invader.asset).width) / 2),
                    y: invader.y - ((this.images.get('death').height - this.images.get(invader.asset).height) / 2),
                    points: points,
                    frame: 0,
                    imageIndex: 0
                });
                this.invaders.splice(i, 1);
            });
            this.invaderspeed += this.invaderspeedincrease.death * invaderIndicesToDelete.length * (this.invaderspeed < 0 ? -1 : 1);
        }
        if(this.invaders.length > 0) {
            let changedDirection = true;
            if(this.rightmostInvader().x + this.images.get('invader1').width >= this.rightlimit) {
                this.invaderspeed = -Math.abs(this.invaderspeed);
            } else if(this.leftmostInvader().x <= this.leftlimit) {
                this.invaderspeed = Math.abs(this.invaderspeed);
            } else {
                changedDirection = false;
            }
            if(changedDirection) {
                this.invaders.forEach((invader) => {
                    invader.y += this.invaderdown;
                });
            }
        } else {
            // Reset level
            this.level++;
            this.invaders = this.initialInvaders();
            this.invaderspeed = this.invaderinitialspeed + (this.invaderspeedincrease.level * this.level);
        }
        // Invader death animations
        {
            let deathAnimationIndicesToDelete = []; 
            this.deathAnimations.forEach((animation, animationIndex) => {
                animation.frame++;
                animation.imageIndex = Math.floor(animation.frame / this.deathAnimationPeriod);
                if(animation.frame > this.deathAnimationFrames) {
                    deathAnimationIndicesToDelete.push(animationIndex);
                }
            });
            deathAnimationIndicesToDelete.sort((a,b) => b-a).forEach((i) => {
                this.deathAnimations.splice(i, 1);
            });
        }
        // Increment frame counter
        this.frame++;
    }
    render() {
        switch(this.state) {
            case 0: // Playing
                this.nextFrame();
                this.renderGame();
                break;
            case 1: // Paused
                this.renderPause();
                break;
            case 2: // Game Over
                this.renderGameOver();
                break;
            case undefined: // Error or something
                break;
            default:
                console.error(`Game in invalid state: ${this.state}`);
                this.state = undefined;
                break;
        }
    }
    renderPause() {
        const text = 'PAUSED';
        const pausex = 340;
        const pausey = this.height/2;
        this.context.font = '80px Arial';
        this.context.fillStyle = 'black';
        this.context.fillText(text, pausex - 5, pausey - 5);
        this.context.fillText(text, pausex - 5, pausey + 5);
        this.context.fillText(text, pausex + 5, pausey - 5);
        this.context.fillText(text, pausex + 5, pausey + 5);
        this.context.fillStyle = 'white';
        this.context.fillText(text, pausex, pausey);
    }
    renderGame() {
        // Background
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.width, this.height);
        // Player shots
        this.shots.forEach((element) => {
            this.drawAsset('shot', element.x, element.y);
        });
        // Player
        this.drawAsset('player', this.player.x, this.player.y);
        // Invaders
        this.invaders.forEach((invader) => {
            this.drawAsset(invader.asset, invader.x, invader.y, invader.animationCounter);
        });
        // Invader death animations
        this.deathAnimations.forEach((animation) => {
            const pointsx = animation.x + this.deathAnimationPoints.initialPosition.x 
                + (this.deathAnimationPoints.frameDelta.x * animation.frame);
            const pointsy = animation.y + this.deathAnimationPoints.initialPosition.y 
                + (this.deathAnimationPoints.frameDelta.y * animation.frame);
            if(animation.imageIndex < this.images.get('death').imgs.length) {
                this.drawAsset('death', animation.x, animation.y, animation.imageIndex);
            }
            this.context.font = '20px Arial';
            this.context.fillStyle = animation.frame % 4 < 3 ? 'white' : '#9999FF';
            this.context.fillText(animation.points, pointsx, pointsy);
        });
    }
    renderGameOver() {
        const text = 'GAME OVER';
        const pausex = 240;
        const pausey = this.height/2;
        this.context.font = '90px Arial';
        this.context.fillStyle = 'black';
        this.context.fillText(text, pausex - 5, pausey - 5);
        this.context.fillText(text, pausex - 5, pausey + 5);
        this.context.fillText(text, pausex + 5, pausey - 5);
        this.context.fillText(text, pausex + 5, pausey + 5);
        this.context.fillStyle = 'white';
        this.context.fillText(text, pausex, pausey);
    }
    onKeyup(evt) {
        switch(evt.keyCode) {
            case this.keybindings.pause:
                this.controls.pause = false;
                break;
            case this.keybindings.shoot:
                this.controls.shot = false;
                break;
            case this.keybindings.left:
                this.controls.left = false;
                if(this.controls.right) {
                    this.player.speed = this.playerspeed;
                } else {
                    this.player.speed = 0;
                }
                break;
            case this.keybindings.right:
                this.controls.right = false;
                if(this.controls.left) {
                    this.player.speed = -this.playerspeed;
                } else {
                    this.player.speed = 0;
                }
                break;
        }
    }
    onKeydown(evt) {
        switch(evt.keyCode) {
            case this.keybindings.pause:
                if(!this.controls.pause) {
                    if(this.state === 0) {
                        this.state = 1;
                    } else if(this.state === 1) {
                        this.state = 0;
                    } else if(this.state === 2) {
                        this.init();
                        this.state = 0;
                    }
                    this.controls.pause = true;
                }
                break;
            case this.keybindings.shoot:
                if(this.state === 0 && !this.controls.shot && this.shots.length < this.shotlimit) {
                    this.shots.push({
                        x: this.player.x + this.images.get('player').width/2 - this.images.get('shot').width/2,
                        y: this.player.y - this.images.get('shot').height*.8,
                        asset: 'shot'
                    });
                    this.controls.shot = true;
                }
                break;
            case this.keybindings.left:
                this.controls.left = true;
                this.player.speed = -this.playerspeed;
                break;
            case this.keybindings.right:
                this.controls.right = true;
                this.player.speed = this.playerspeed;
                break;
        }
    }
}
