
class SpaceInvaders {
    constructor(context, width=context.canvas.width, height=context.canvas.height, fps=30) {
        this.context = context;
        this.width = width;
        this.height = height;
        this.fps = fps;
        this.keydownFunction = (evt) => {this.onKeydown(evt)};
    }
    start() {
        document.addEventListener("keydown", this.keydownFunction);
        this.intervalID = setInterval(() => {this.gameLoop()}, 1000/this.fps);
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
