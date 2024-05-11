INITAL_HP = 100;
const moondoPath = "./img/moondo.jpg";
const knifePath = "./img/moondo_knife.jpg";
const heartPath = "./img/heart.jpg";

let moondoImg;
let knifeImg;
let heartImg;

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const uiCanvas = document.getElementById("ui");
const uiContext = canvas.getContext("2d");

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
uiCanvas.width = CANVAS_WIDTH;
uiCanvas.height = CANVAS_HEIGHT;

let ui;

let player1;
let player2;
let overMoondo;

let idNum = 0;

const state = {
	start: false,
	over: false,
	winner: null,
	super: false,
}

const flyingKnives = [];
const flashCools = [0, 0];
const knifeCools = [0, 0];

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

const drawer = {
	startDraw() {
		context.save();
	},
	finishDraw() {
		context.restore();
	},
	fillCircle: (x, y, r, lineColor="#fff") => {
	    context.beginPath();
	    context.arc(x, y, r, 0, Math.PI * 2);
	    context.lineWidth = 5;

	    context.strokeStyle = lineColor;
	    context.stroke();
	    context.closePath();
	},
	fillText: (text, x, y, fontSize, color="white") => {
	    context.fillStyle = color;
	    context.font = `${fontSize}px Arial`;
	    context.fillText(text, x, y);
	},
	fillRect: (x, y, w, h, color="#171717") => {
	    context.beginPath();
	    context.fillStyle = color;
	    context.fillRect(x, y, w, h);
	    context.stroke();
	    context.closePath();
	},
	drawImage: ({img, x, y, w, h, r}) => {
		if (!r) {
			context.drawImage(img, x, y, w, h);
		} else {
			context.beginPath();
			context.arc(x, y, r, 0, Math.PI * 2);
			context.clip();
			context.drawImage(img, x - r, y - r, 2 * r, 2 * r);
			context.closePath();
		}
	},
	drawRotatedImage({img, w, h, cx, cy, r, rotateDegree}) {
		context.translate(cx, cy);
		context.rotate((rotateDegree * Math.PI) / 180);
		context.drawImage(img, r, - h / 2, w, h);
	}
}

const normalize = (n) => n < 0 ? -1 : n > 0 ? 1 : 0;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const between = (v, min, max) => min <= v && v <= max;

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

    static dist(vec1, vec2) {
    	return Math.sqrt((vec1.x - vec2.x) * (vec1.x - vec2.x) + (vec1.y - vec2.y) * (vec1.y - vec2.y));
    }
}

Vector.mult = (v, n) => new Vector(v.x * n, v.y * n);
Vector.div = (v, n) => new Vector(v.x / n, v.y / n);

const settingCandidates = {
	default: {
		KNIFE_COOL_TIME: 2000,
		FLASH_DIST : 300,
		FLASH_COOL_TIME: 30000,
		DAMAGE: 15,
		VELOCITY: 10,
		get ROTATE_DEG_START() {
			return randomInt(360);
		},
		get ROTATE_DIR_START() {
			return [-1, 1][randomInt(2) - 1];
		},
		get ROTATE_V_START() {
			return 7;
		},
		get THROW_V_START() {
			return 10;
		},
	}, 
	random: {
		KNIFE_COOL_TIME: 2000,
		FLASH_DIST : 300,
		FLASH_COOL_TIME: 30000,
		DAMAGE: 15,
		VELOCITY: 10,
		get ROTATE_DEG_START() {
			return randomInt(360);
		},
		get ROTATE_DIR_START() {
			return [-1, 1][randomInt(2) - 1];
		},
		get ROTATE_V_START() {
			return randomInt(2, 10);
		},
		get THROW_V_START() {
			return randomInt(7, 15);
		},
	},
	default_urf: {
		KNIFE_COOL_TIME: 200,
		FLASH_DIST : 300,
		FLASH_COOL_TIME: 1000,
		DAMAGE: 15,
		VELOCITY: 10,
		get ROTATE_DEG_START() {
			return randomInt(360);
		},
		get ROTATE_DIR_START() {
			return [-1, 1][randomInt(2) - 1];
		},
		get ROTATE_V_START() {
			return 7;
		},
		get THROW_V_START() {
			return 10;
		},
	}, 
	random_urf: {
		KNIFE_COOL_TIME: 200,
		FLASH_DIST : 300,
		FLASH_COOL_TIME: 1000,
		DAMAGE: 15,
		VELOCITY: 10,
		get ROTATE_DEG_START() {
			return randomInt(360);
		},
		get ROTATE_DIR_START() {
			return [-1, 1][randomInt(2) - 1];
		},
		get ROTATE_V_START() {
			return randomInt(2, 10);
		},
		get THROW_V_START() {
			return randomInt(7, 15);
		},
	},
	just_two: {
		KNIFE_COOL_TIME: 2000,
		FLASH_DIST : 300,
		FLASH_COOL_TIME: 30000,
		DAMAGE: 51,
		VELOCITY: 10,
		get ROTATE_DEG_START() {
			return randomInt(360);
		},
		get ROTATE_DIR_START() {
			return [-1, 1][randomInt(2) - 1];
		},
		get ROTATE_V_START() {
			return 7;
		},
		get THROW_V_START() {
			return 10;
		},
	}, 
	just_one: {
		KNIFE_COOL_TIME: 2000,
		FLASH_DIST : 300,
		FLASH_COOL_TIME: 30000,
		DAMAGE: 9999,
		VELOCITY: 10,
		get ROTATE_DEG_START() {
			return randomInt(360);
		},
		get ROTATE_DIR_START() {
			return [-1, 1][randomInt(2) - 1];
		},
		get ROTATE_V_START() {
			return 7;
		},
		get THROW_V_START() {
			return 10;
		},
	}, 
	super_urf: {
		KNIFE_COOL_TIME: 30,
		FLASH_DIST : 150,
		FLASH_COOL_TIME: 10,
		DAMAGE: 20,
		VELOCITY: 15,
		get ROTATE_DEG_START() {
			return randomInt(360);
		},
		get ROTATE_DIR_START() {
			return [-1, 1][randomInt(2) - 1];
		},
		get ROTATE_V_START() {
			return randomInt(50, 100);
		},
		get THROW_V_START() {
			return randomInt(30, 50);
		},
	},
}


let setting = settingCandidates.default;

class OverMoondo {
	constructor() {
		this.imgSide = 3000;
		this.targetSide = 1050;
		this.ratio = (this.imgSide / this.targetSide) * 100;
		this.position = new Vector(500, 400);
		this.t = 100;
	}

	draw() {
		if (this.imgSide > this.targetSide) {
			this.imgSide -= 40;
		}

		drawer.startDraw();
		drawer.drawImage({
			img: moondoImg,
			x: this.position.x,
			y: this.position.y,
			r: this.imgSide / 2,
		});
		drawer.finishDraw();

		if (this.imgSide <= this.targetSide) {
			drawer.startDraw();
			drawer.drawImage({
				img: heartImg,
				x: 293,
				y: 235,
				r: 35,
			});
			drawer.fillCircle(293, 235, 36, "black");
			drawer.finishDraw();

			drawer.startDraw();
			drawer.drawImage({
				img: heartImg,
				x: 568,
				y: 242,
				r: 35,
			});
			drawer.fillCircle(568, 242, 36, "black");
			drawer.finishDraw();
		}
	}
}

class UI {
	constructor() {

	}

	draw() {
		if (!state.start) {
			drawer.fillText("우측에서 모드 설정", 340, 310, 40, "white");
			drawer.fillText("player1: 조작: wasd / 점멸: c 스탑: v 오대식: b", 310, 380, 20, "white");
			drawer.fillText("player2: 조작: 방향키 / 점멸: m 스탑: , 오대식: .", 310, 430, 20, "white");
		}

		if (state.over) {
			drawer.fillText("Game Over", 730, 400, 40, "black");
			drawer.fillText("승리: Player " + state.winner, 725, 450, 35, "black");
			drawer.fillText("스페이스바로 다시 시작", 670, 500, 30, "black");
		}
	}
}

class Direction {
	constructor() {
		this.up = false;
		this.down = false;
		this.left = false;
		this.right = false;
		this.stop = false;
	}

	makeUp() {
		this.up = true;
		this.down = false;
		this.left = false;
		this.right = false;
		this.stop = false;
	}

	makeDown() {
		this.up = false;
		this.down = true;
		this.left = false;
		this.right = false;
		this.stop = false;
	}

	makeLeft() {
		this.up = false;
		this.down = false;
		this.left = true;
		this.right = false;
		this.stop = false;
	}

	makeRight() {
		this.up = false;
		this.down = false;
		this.left = false;
		this.right = true;
		this.stop = false;
	}

	makeStop() {
		this.up = false;
		this.down = false;
		this.left = false;
		this.right = false;
		this.stop = true;
	}
}

class Player {
	constructor(y, color) {
		this.id = idNum;
		idNum += 1;

		this.position = new Vector(canvas.width / 2, y);
		this.flashReady = true;

		this.direction = new Direction();

		this.moondo = new Moondo(this.id, this.position, 50, color);
		this.hpBar = new HpBar(this.id, this.position);
		this.knife = new Knife(this.position, this.moondo.r);
		this.hit = false;
	}

	get velocityX() {
		return new Vector(setting.VELOCITY, 0);
	}

	get velocityY() {
		return new Vector(0, setting.VELOCITY);
	}

	get flashDistX() {
		return new Vector(setting.FLASH_DIST, 0);
	}

	get flashDistY() {
		return new Vector(0, setting.FLASH_DIST);
	}

	update() {
		this.updatePos(this.velocityX, this.velocityY);

		if (this.hit) {
			this.hpBar.hit();
			this.hit = false;
		}
	}

	draw() {
		this.moondo.draw();
		this.hpBar.draw();
		if (this.knife) {
			this.knife.draw();
		}
		
		// drawer.startDraw();
		// drawer.fillCircle(this.position.x, this.position.y, 1, "black");
		// drawer.finishDraw();
	}

	throwKnife() {
		if (this.knife) {
			this.knife.thrown();
			this.knife = null;

			knifeCools[this.id] = setting.KNIFE_COOL_TIME;
			const interval = setInterval(() => {
				knifeCools[this.id] -= 10;
				document.getElementById("knife-" + this.id).innerText = (knifeCools[this.id] / 1000).toFixed(2);
			}, 10);
			setTimeout(() => { 
				this.respawnKnife();
				clearInterval(interval);
			}, setting.KNIFE_COOL_TIME);
		}
	}

	respawnKnife() {
		this.knife = new Knife(this.position, this.moondo.r);
	}

	flash() {
		if (this.flashReady) {
			this.updatePos(this.flashDistX, this.flashDistY);
			this.flashReady = false;

			flashCools[this.id] = setting.FLASH_COOL_TIME;
			const interval = setInterval(() => {
				flashCools[this.id] -= 10;
				document.getElementById("flash-" + this.id).innerText = (flashCools[this.id] / 1000).toFixed(2);
			}, 10);
			setTimeout(() => { 
				this.flashReady = true;
				clearInterval(interval);
			}, setting.FLASH_COOL_TIME);
		}
	}

	updatePos(vX, vY) {
		const diff = new Vector(this.position.x, this.position.y);
		if (this.direction.up) {
			diff.sub(vY);
		} else if (this.direction.down) {
			diff.add(vY);
		} if (this.direction.left) {
			diff.sub(vX);
		} else if (this.direction.right) {
			diff.add(vX);
		}
		diff.x = clamp(diff.x, this.width / 2, canvas.width - this.width / 2);
		diff.y = clamp(diff.y, this.height / 2, canvas.height - this.height / 2 + 10);
		
		diff.sub(this.position);
		if (this.knife) {
			this.knife.update(diff);
			this.knife.rotate();
		}
		this.moondo.update(diff);
		this.hpBar.update(diff);
		this.position.add(diff);
	}

	dead() {
		return this.hpBar.hp <= 0;
	}

	get width() {
		return Math.max(this.hpBar.width, this.moondo.width);
	}

	get height() {
		return this.hpBar.height + this.moondo.height + 15;
	}
}


class Drawable {
	constructor() {
		this.position = new Vector(0, 0);
	}
	draw() {

	}

	update(diffVector) {
		this.position.add(diffVector);
	}
}


class HpBar extends Drawable {
	constructor(id, playerPos) {
		super();
		this.id = id;
		this.hp = INITAL_HP;
		this.width = 100;
		this.height = 10;
		this.position = this.getPosfromPlayerPos(playerPos);
	}

	getPosfromPlayerPos(playerPos) {
		return new Vector(playerPos.x - this.width / 2, playerPos.y - 70);
	}

	draw() {
		drawer.startDraw();
		drawer.fillRect(
			this.position.x,
			this.position.y,
			this.width,
			this.height,
			"black",
		);
		drawer.fillRect(
			this.position.x,
			this.position.y,
			this.width * this.percent,
			this.height,
			"red",
		);
		drawer.finishDraw();
		document.getElementById("hp-" + this.id).innerText = `HP: ${this.hp} / ${INITAL_HP}`;
	}

	get percent() {
		return this.hp / INITAL_HP;
	}

	hit() {
		this.hp -= setting.DAMAGE;
		this.hp = Math.max(this.hp, 0);
	}
}

class Moondo extends Drawable  {
	constructor(id, playerPos, r, color) {
		super();
		this.id = id;
		this.r = r;
		this.color = color;
		this.position = this.getPosfromPlayerPos(playerPos);
	}

	getPosfromPlayerPos(playerPos) {
		return new Vector(playerPos.x, playerPos.y);
	}

	draw() {
		drawer.startDraw();
		drawer.drawImage({
			img: moondoImg,
			x: this.position.x,
			y: this.position.y,
			r: this.r,
		});
		drawer.fillCircle(
			this.position.x,
			this.position.y,
			this.r,
			this.color,
		);
		drawer.finishDraw();
	}

	get width() {
		return 2 * this.r;
	}

	get height() {
		return 2 * this.r;
	}
}

class Knife extends Drawable {
	constructor(playerPos, moondoRadius) {
		super();
		// 280 x 120
		this.imgWidth = 47;
		this.imgHeight = 20;

		this.width = 2 * (this.imgWidth + moondoRadius);
		this.height = this.width;
		this.r = moondoRadius + 5;

		this.position = this.getPosfromPlayerPos(playerPos, moondoRadius);
		this.rotateDegree = setting.ROTATE_DEG_START;
		this.rotateDirection = setting.ROTATE_DIR_START;
		this.rotateVelocity = setting.ROTATE_V_START;
		this.throwVelocity = setting.THROW_V_START;
	}

	rotate() {
		this.rotateDegree += (this.rotateDirection * this.rotateVelocity);
	}

	draw() {
		drawer.startDraw();
		drawer.drawRotatedImage({
			img: knifeImg,
			w: this.imgWidth,
			h: this.imgHeight,
			cx: this.position.x,
			cy: this.position.y,
			r: this.r,
			rotateDegree: this.rotateDegree,
		});
		drawer.finishDraw();
	}

	throwDraw() {
		drawer.startDraw();
		drawer.drawRotatedImage({
			img: knifeImg,
			w: this.imgWidth,
			h: this.imgHeight,
			cx: this.position.x,
			cy: this.position.y,
			r: -this.imgWidth / 2,
			rotateDegree: this.selfRotateDegree,
		});
		drawer.finishDraw();
		// drawer.startDraw();
		// drawer.fillCircle(this.position.x, this.position.y, 1, "blue");
		// drawer.finishDraw();
	}

	thrown() {
		flyingKnives.push(this);
		let newX = this.position.x + Math.cos((this.rotateDegree * Math.PI) / 180) * (this.r + this.imgWidth / 2);
		let newY = this.position.y + Math.sin((this.rotateDegree * Math.PI) / 180) * (this.r + this.imgWidth / 2);
		this.position.x = newX;
		this.position.y = newY;
		this.selfRotateDegree = this.rotateDegree;
	}

	throwUpdate() {
		[player1, player2].forEach(player => {
			if (this.hit(player)) {
				player.hit = true;
				const idx = flyingKnives.indexOf(this);
				delete flyingKnives[idx];
			}
		});

		if (this.finishThrown()) {
			const idx = flyingKnives.indexOf(this);
			delete flyingKnives[idx];
			return;
		}
		const diff = new Vector(
			this.throwVelocity * Math.cos((this.rotateDegree * Math.PI) / 180),
			this.throwVelocity * Math.sin((this.rotateDegree * Math.PI) / 180),
		);
		this.position.add(diff);
		this.selfRotateDegree += (this.rotateDirection * 20);
	}

	finishThrown() {
		return this.position.x < 0 || this.position.x > canvas.width || this.position.y < 0 || this.position.y > canvas.height;
	}

	getPosfromPlayerPos(playerPos) {
		return new Vector(playerPos.x, playerPos.y);
	}

	hit(player) {
		let hit = false;
		const oppositeMoondo = player.moondo;
		// 4 꼭짓점 중 하나가 moondo 안에 들어오거나, 아니면 수선의 발이 선분 위에 있고 d < r
		const halfW = this.imgWidth / 2;
		const halfH = this.imgHeight / 2;

		const rotateRad = (this.selfRotateDegree * Math.PI) / 180;
		const alpha = Math.atan(halfH / halfW);

		const points = [];
		[rotateRad + alpha, rotateRad - alpha].forEach(rad => {
			const x = halfW * Math.cos(rad);
			const y = halfW * Math.sin(rad)
			const vec1 = new Vector(this.position.x + x, this.position.y + y);
			const vec2 = new Vector(this.position.x - x, this.position.y - y);
			// drawer.startDraw();
			// drawer.fillCircle(vec1.x, vec1.y, 1, "red");
			// drawer.fillCircle(vec2.x, vec2.y, 1, "red");
			// drawer.finishDraw();

			points.push(new Vector(this.position.x + x, this.position.y + y));
			points.push(new Vector(this.position.x - x, this.position.y - y));
		});

		// 4 점이 문도 안에 들어왔는지
		points.forEach(point => {
			if (Vector.dist(oppositeMoondo.position, point) < oppositeMoondo.r) {
				hit = true;
			}
		});
		return hit;

		// 안들어왔으면 각 변 검사
		// TODO
		// 이정도 정확도까진 필요 없을듯 ? 
	}
}

const clear = () => {
    context.clearRect(-100000, -100000, 200000, 200000);
}

const draw = () => {
	clear();
	player1.draw();
	player2.draw();
	flyingKnives.forEach(knife => {
		knife.throwDraw();
	});

	if (overMoondo) overMoondo.draw();
	ui.draw();
}

const update = () => {
	flyingKnives.forEach(knife => {
		knife.throwUpdate();
	});
	player1.update();
	player2.update();

	if (player1.dead() || player2.dead()) {
		state.over = true;
		state.winner = (player1.dead()) ? 1 : 0;
		overMoondo = new OverMoondo();
	}
}

const setup = () => {
	ui = new UI();

	moondoImg = new Image();
	moondoImg.src = moondoPath;
	knifeImg = new Image();
	knifeImg.src = knifePath;
	heartImg = new Image();
	heartImg.src = heartPath;

	player1 = new Player(200, "black");
	player2 = new Player(600, "red");
	player1.direction.makeStop();
	player2.direction.makeStop();
}

let frame = 0;

function sleep(ms) {
	const t = Date.now() + ms;
	while (Date.now() < t) {}
}
const run = () => {
	draw();
	if (state.start && !state.over) {
		update();
		frame += 1;
		// sleep(100);
	}
	requestAnimationFrame(run);

}

window.addEventListener("keydown", ({key}) => {
	if (!state.start) {
		if (key !== " ") return;
		state.start = true;
		document.querySelector(".mode-select").style.display = "none";
		document.querySelector(".stat-board").style.display = "block";
	} else {
		if (key === "w") {
			player1.direction.makeUp();
		} else if (key === "a") {
			player1.direction.makeLeft();
		} else if (key === "s") {
			player1.direction.makeDown();
		} else if (key === "d") {
			player1.direction.makeRight();
		} else if (key === "v") {
			player1.direction.makeStop();
		} else if (key === "b") {
			player1.throwKnife();
		} else if (key === "c") {
			player1.flash();
		}

		if (key === "ArrowUp") {
			player2.direction.makeUp();
		} else if (key === "ArrowLeft") {
			player2.direction.makeLeft();
		} else if (key === "ArrowDown") {
			player2.direction.makeDown();
		} else if (key === "ArrowRight") {
			player2.direction.makeRight();
		} else if (key === ",") {
			player2.direction.makeStop();
		} else if (key === ".") {
			player2.throwKnife();
		} else if (key === "m") {
			player2.flash();
		}

		if (key === "q") {
			state.over = true;
		}

		if (state.over && key === " ") {
			return location.reload();
		}
	}
});

const btns = document.querySelectorAll(".btn")
btns.forEach(btn => {
	btn.addEventListener("click", (e) => {
		const id = e.target.id;
		btns.forEach(b => b.removeAttribute("selected"));
		btn.setAttribute("selected", "");
		setting = settingCandidates[id];
		if (id.includes("super")) {
			state.super = true;
		}
	});
});

setup();
requestAnimationFrame(run);
