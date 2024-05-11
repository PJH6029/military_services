const randomInt = (...args) => {
    if (args.length === 1) {
        const [n] = args;
        return Math.ceil(Math.random() * n);
    }

    if (args.length === 2) {
        const [start, end] = args;

        if (start > end) throw Error("시작 > 끝");

        return Math.ceil(Math.random() * (end - start)) + start;
    }
}

const random = (...args) => {
    if (args.length === 1) {
        const [n] = args;
        return Math.ceil(Math.random() * n);
    }

    if (args.length === 2) {
        const [start, end] = args;

        if (start > end) throw Error("시작 > 끝");

        return Math.random() * (end - start) + start;
    }
}

const normalize = (n) => n < 0 ? -1 : n > 0 ? 1 : 0;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const between = (v, min, max) => min <= v && v <= max;

// Vector Lib
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get() {
        return new Vector(this.x, this.y);
    }

    normalize() {
        this.x = normalize(this.x);
        this.y = normalize(this.y);
    }
}

Vector.mult = (v, n) => new Vector(v.x * n, v.y * n);
Vector.div = (v, n) => new Vector(v.x / n, v.y / n);

// Canvas Lib
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const uiCanvas = document.getElementById("ui");
const uiContext = uiCanvas.getContext("2d");

const width = 1000;
const height = 800;

canvas.width = width;
canvas.height = height;

uiCanvas.width = width;
uiCanvas.height = height;

const rect = (x, y, w, h) => {
    context.beginPath();
    context.rect(x, y, w, h);
    context.strokeStyle = "#ffffff";
    context.stroke();
    context.closePath();
}

const fillRect = (x, y, w, h, color="#171717") => {
    context.save();
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
    context.stroke();
    context.closePath();
    context.restore();
}

const circle = (x, y, r) => {
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.lineWidth = 3;

    context.strokeStyle = "#fff";
    context.stroke();
    context.closePath();
}

const fillText = (text, x, y, fontSize, color="white") => {
    uiContext.fillStyle = color;
    uiContext.font = `${fontSize}px Arial`;
    uiContext.fillText(text, x, y);
}

const clear = () => {
    context.clearRect(-100000, -100000, 200000, 200000);
}

// User Code
const BLOCK_START_WIDTH = 300;
const BLOCK_HEIGHT = 50;
const SLIDE_START_LEVEL = 10;
const X_TOLERANCE_PERCENT = 0.02;

class Block {
    constructor(x, width, level) {
        this.velocity = new Vector(5 + ~~(level / 15), 0);
        this.height = BLOCK_HEIGHT;
        this.level = level;
        this.width = width;
        this.moving = true;
        this.position = new Vector(x, this.targetY);
    }

    draw() {
        fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height - 1,
            this.color
        );
    }

    get color() {
        return `hsl(${this.level}, 100%, 50%)`;
    }

    fitStack({ stackStartX, stackWidth }) {
        const stackEndX = stackStartX + stackWidth;
        const fit = 
            between(this.position.x, stackStartX, stackEndX) ||
            between(this.position.x + this.width, stackStartX, stackEndX);
        
        return fit;
    }

    trim({ stackStartX, stackWidth }) {
        if (Math.abs(stackStartX - this.position.x) < this.width * X_TOLERANCE_PERCENT) {
            this.position.x = stackStartX;
        } else {
            const stackEndX = stackStartX + stackWidth;
            const blockEndX = clamp(
                this.position.x + this.width,
                stackStartX,
                stackEndX
            );
            this.position.x = clamp(this.position.x, stackStartX, stackEndX);
            this.width = blockEndX - this.position.x;
        }
    }

    stop() {
        this.velocity = new Vector(0, 0);
        this.moving = false;
    }

    down() {
        this.velocity = new Vector(0, 30);
    }

    get targetY() {
        return height - this.level * this.height;
    }

    get finishMoving() {
        return !this.moving;
    }

    update(state) {
        this.position.add(this.velocity);

        if (this.moving && this.finishMoving && this.fitStack(state)) {
            this.stop();
            this.position.y = this.targetY;
        }
    }

    checkEdges() {
        if (this.position.x > width - this.width) {
            this.position.x = width - this.width;
            this.velocity.x *= -1;
        } else if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x *= -1;
        }

        if (this.position.y > height - this.height) {
            this.stop();
            this.position.y = height - this.height;
        }
    }
}

class Slider {
    constructor(t) {
        this.t = t;
    }

    slide(t) {
        this.t += t;
    }

    update(state) {
        if (this.t > 0) {
            this.t -= 2;
            context.translate(0, 2);
        }
    }

    get finishSliding()  {
        return this.t < 0;
    }
}

class Scaler {
    constructor(level) {
        this.level = level;
        this.totalHeight = BLOCK_HEIGHT * this.level + 150;
        this.ratio = (height / this.totalHeight) * 100;
        this.t = 100;
    }

    update() {
        const totalHeight = BLOCK_HEIGHT * this.level + 150;
        const ratio = this.t / 100;

        if (totalHeight > height && this.t > this.ratio) {
            this.t -= 1;
            const scaleX = ratio;
            const scaleY = ratio;
            const translateX = 5 * (100 - this.t);
            const translateY = (totalHeight - height) * ratio + 150;
            context.setTransform(scaleX, 0, 0, scaleY, translateX, translateY);
        }
    }
}

const getBestScore = () => localStorage.getItem("stackBestLevel") || 1;

const setBestScore = (score) => localStorage.setItem("stackBestLevel", Math.max(getBestScore(), score));

class UI {
    constructor(state) {
        this.state = state;
    }

    draw() {
        uiContext.clearRect(0, 0, width, height);

        if (!this.state.start) {
            fillText("스페이스바로 시작하기", 300, 150, 40, "white");
            fillText(`최고기록 ${getBestScore() - 1}`, 380, 300, 40, "white");
        } else {
            const levelLength = this.state.level.toString().length;
            const levelTextOffset = 15 * levelLength;
            fillText(
                this.state.level - 1,
                width / 2 - levelTextOffset,
                150,
                60,
                "white"
            );
        }

        if (this.state.over) {
            fillText("게임오버", 410, 250, 50, "white");
            fillText("스페이스바로 다시 시작", 300, 350, 40, "white");
        }
    }
}

// Main Code
let blocks = [];
let slider;
let scaler;
let ui;

const state = {
    start: false,
    over: false,
    level: 1,
    blockFalling: false,
    stackWidth: 300,
    stackStartX: width / 2 - BLOCK_START_WIDTH / 2,
};

const setup = () => {
    blocks = [new Block(state.stackStartX, BLOCK_START_WIDTH, state.level)];
    blocks[0].stop();

    slider = new Slider(0);
    ui = new UI(state);
}

const draw = () => {
    clear();

    blocks.forEach((block) => {
        block.update(state);
        block.checkEdges();
        block.draw();
    })

    slider.update(state);

    if (scaler) scaler.update();
    
    ui.draw();
}

const run = () => {
    draw();

    const block = blocks[blocks.length - 1];
    if (state.start && !state.over && block.finishMoving) {
        if (block.fitStack(state)) {
            block.trim(state);
            state.level += 1;
            state.stackWidth = block.width;
            state.stackStartX = block.position.x;

            blocks.push(new Block(0, state.stackWidth, state.level));

            if (state.level >= SLIDE_START_LEVEL) {
                slider.slide(50);
            }
            setBestScore(state.level);
        } else {
            console.log("game over!");
            block.down();
            state.over = true;
            scaler = new Scaler(state.level);
        }
    }
    requestAnimationFrame(run);
}

window.onkeypress = ({ key }) => {
    if (key !== " ") return;

    state.start = true;

    if (state.over) return location.reload();

    const block = blocks[blocks.length - 1];
    block.stop();
};

setup();

requestAnimationFrame(run);