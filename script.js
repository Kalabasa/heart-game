'use strict';

const SCALE = 4;

var game = new Phaser.Game(300, 400, Phaser.AUTO, '', {preload: preload, create: create, update: update});

var bg;
var heart;
var bloodEmitter;
var scoreText;

var score = 0;

var clicked = false;
var dead = false;

function preload() {
	game.load.spritesheet('heart', 'heart.png', 16, 16);
	game.load.spritesheet('blood', 'blood.png', 1, 1);
	game.load.spritesheet('bg', 'bg.png', 8, 8);
}

function create() {
	bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg', 0);
	bg.tileScale.set(SCALE);

	game.physics.startSystem(Phaser.Physics.ARCADE);

	heart = game.add.sprite(0, 0, 'heart');
	heart.anchor.set(0.5, 0.5);
	heart.position.set(game.width / 2, game.height / 2);
	heart.hitArea = new Phaser.Circle(0, 0, Math.max(heart.width, heart.height) * 2);

	heart.smoothed = false;
	heart.scale.set(SCALE);

	game.physics.enable(heart);
	heart.body.bounce.set(0.8, 0.4);

	heart.inputEnabled = true;

	bloodEmitter = game.add.emitter();
	bloodEmitter.scale.set(SCALE);
	bloodEmitter.makeParticles('blood', [0, 1]);
	bloodEmitter.gravity.set(0, 300);
	bloodEmitter.maxRotation = 0;

	scoreText = game.add.text(0, 0, '', {
		font: 'bold 32px monospace',
		fill: '#000',
		boundsAlignH: 'center',
		boundsAlignV: 'center'
	});
	scoreText.setTextBounds(0, 20, game.width, 50);
	updateScoreText();
}

function update() {
	checkClick();
	checkBounds();
	checkDeath();
}

function checkClick() {
	var activePointer = game.input.activePointer;
	if (!dead && !clicked
		&& activePointer.isDown 
		&& activePointer.duration < 100
		&& activePointer.targetObject 
		&& activePointer.targetObject.sprite === heart) {
		clicked = true;
		throwHeart();
		score++;
		updateScoreText();
	}
	clicked &= !activePointer.isUp;
}

function updateScoreText() {
	scoreText.text = score || ' ';
}

function checkBounds() {
	if (heart.body.left < game.world.bounds.left) {
		heart.body.position.add(game.world.bounds.left - heart.body.left, 0);
		heart.body.velocity.x = Math.abs(heart.body.velocity.x);
	}
	if (heart.body.right > game.world.bounds.right) {
		heart.body.position.add(game.world.bounds.right - heart.body.right, 0);
		heart.body.velocity.x = -Math.abs(heart.body.velocity.x);
	}
}

function checkDeath() {
	if (!dead && heart.body.bottom > game.world.bounds.bottom) {
		dead = true;

		heart.frame = 1;
		heart.body.gravity.set(0);
		heart.body.velocity.set(0);
		heart.body.position.add(0, game.world.bounds.bottom - heart.body.bottom);

		bloodEmitter.position.set(heart.x, heart.y);
		bloodEmitter.start(true, 2000, null, 40);

		scoreText.fill = '#c00';

		bg.frame = 1;

		console.log('oh no, you broke my heart');
	}
}

function throwHeart() {
	heart.body.gravity.set(0, 3000);
	var source = game.input.activePointer.position.clone();
	source.y = heart.top;
	game.physics.arcade.velocityFromRotation(source.angle(heart.position), 800, heart.body.velocity);
	heart.body.velocity.multiply(1, 0.2);
	heart.body.velocity.add(0, -1000);
}