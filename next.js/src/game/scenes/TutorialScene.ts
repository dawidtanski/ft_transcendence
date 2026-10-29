import Phaser from "phaser";

var platforms: Phaser.Physics.Arcade.StaticGroup;

export default class TutorialScene extends Phaser.Scene {
	private player!: Phaser.Physics.Arcade.Sprite;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("tutorial");
  }

  preload() {
    this.load.setPath("/assets");
    this.load.image("sky", "sky.png");
	this.load.image("ground", "platform.png");
	this.load.image("star", "star.png");
	this.load.image("bomb", "bomb.png");
	this.load.spritesheet("dude", "dude.png", { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    this.add.image(400, 300, "sky");
	this.add.image(400, 300, "star");

	var platforms = this.physics.add.staticGroup();
	platforms.create(400, 568, "ground").setScale(2).refreshBody();
	platforms.create(600, 400, "ground");
	platforms.create(50, 250, "ground");
	platforms.create(750, 220, "ground");

	this.player = this.physics.add.sprite(100, 450, "dude");
	this.player.setBounce(0.2);
	this.player.setCollideWorldBounds(true);

	this.physics.add.collider(this.player, platforms);

	this.anims.create({
		key: "left",
		frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
		frameRate: 10,
		repeat: -1,
	});

	this.anims.create({
		key: "turn",
		frames: [{ key: "dude", frame: 4 }],
		frameRate: 20,
	});

	this.anims.create({
		key: "right",
		frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
		frameRate: 10,
		repeat: -1,
	});

	this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() { 
	if (this.cursors.left.isDown)
	{
		this.player.setVelocityX(-160);

		this.player.anims.play('left', true);
	}
	else if (this.cursors.right.isDown)
	{
		this.player.setVelocityX(160);

		this.player.anims.play('right', true);
	}
	else
	{
		this.player.setVelocityX(0);

		this.player.anims.play('turn');
	}

	if (this.cursors.up.isDown && this.player.body!.touching.down)
	{
		this.player.setVelocityY(-330);
	}
  }

}