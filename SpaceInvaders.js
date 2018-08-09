
imageNames = [
    "player",

];
imageURLs = imageNames.map(img => ("assets/" + img + ".png"));
images = null;

function LoadImagePromise(src) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject("Could not load " + src);
        img.src = src;
    })
}

class SpaceInvaders {
    constructor(context, fps=30) {
        this.context = context;
        this.fps = fps;
        this.keydownFunction = (evt) => this.onKeydown(evt);
        this.width = 400;
        this.height = 400;
        this.player = {x: 200, y: 10, lives: 3};
    }
    load() {
        return new Promise((resolve, reject) => {
            if(images) {
                resolve();
            } else {
                Promise.all(imageURLs.map(img => LoadImagePromise(img))).then((imgArray) => {
                    images = (() => {
                        let result = new Map();
                        imageNames.forEach((element, index) => {
                            result.set(imageNames[index], imgArray[index]);
                        });
                        return result;
                    })();
                    resolve();
                }).catch((reason) => reject(reason));
            }
        });
    }
    start() {
        document.addEventListener("keydown", this.keydownFunction);
        this.intervalID = setInterval(() => this.gameLoop(), 1000/this.fps);
    }
    stop() {
        clearInterval(this.intervalID);
        document.removeEventListener("keydown", this.keydownFunction);
    }
    gameLoop() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);
    }
    onKeydown(evt) {
        console.log(evt.keyCode);
        switch(evt.keyCode) {
            case 13:
                // Return
                break;
            case 32:
                // Space
                break;
            case 37:
                // Left
                break;
            case 38:
                // Up
                break;
            case 39:
                // Right
                break;
            case 40:
                // Down
                break;
        }
    }
}
