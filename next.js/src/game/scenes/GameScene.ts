import Phaser from "phaser";
import { GAME_CONFIG } from "../config";
import Player from "../objects/Player";
import Bullet from "../objects/Bullet";

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private bullets!: Phaser.Physics.Arcade.Group;
    private nextShotAt = 0;

  constructor() {
    super("game");
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

        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 20,
            runChildUpdate: true,
        });
        this.player = new Player(this, 400, 550);
        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    update() { 
        if (this.cursors.left.isDown)
        {
            this.player.moveLeft();
        }
        else if (this.cursors.right.isDown)
        {
            this.player.moveRight();
        }

        const time = this.time.now;
        if (this.cursors.space.isDown && time > this.nextShotAt) {
            this.nextShotAt = time + 400;   // ms between shots
            const bullet = this.bullets.get(this.player.x, this.player.y - 10) as Bullet | null;
            if (bullet) bullet.fire(this.player.x, this.player.y - 10, -400);
        }
    }
}