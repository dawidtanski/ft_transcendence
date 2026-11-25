import Phaser from "phaser";
import { INVADER_COLS, INVADER_STEP_DOWN } from "../config";
import { INVADER_ROWS } from "../config";
import { INVADER_SPACING_X } from "../config";
import { INVADER_SPACING_Y } from "../config";
import { INVADER_START_SPEED } from "../config";
import { INVADER_SPEEDUP } from "../config";
import Player from "../objects/Player";
import Bullet from "../objects/Bullet";
import Invader from "../objects/Invaders";

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private bullets!: Phaser.Physics.Arcade.Group;
    private nextShotAt = 0;
    private invaders!: Phaser.Physics.Arcade.Group;
    private invaderDir = 1;
    private invaderSpeed = INVADER_START_SPEED;
    private score = 0;

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

        this.invaders = this.physics.add.group({ classType: Invader });
        this.invaderDir = 1;
        this.invaderSpeed = INVADER_START_SPEED;

        for (let row = 0; row < INVADER_ROWS; row++)
        {
            for (let col = 0; col < INVADER_COLS; col++)
            {
                const inv = new Invader(this, 40 + col * INVADER_SPACING_X, 60 + row * INVADER_SPACING_Y);
                this.invaders.add(inv, true);   // true = add to scene as well
                (inv.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            }
        }
        this.physics.add.overlap(
        this.bullets,
        this.invaders,
        (bulletObj, invaderObj) => {
            const bullet = bulletObj as Bullet;
            const invader = invaderObj as Invader;

            bullet.disableBody(true, true);   // return the bullet to the pool
            invader.destroy();                // remove the invader from the game

            this.score += invader.points;
            this.invaderSpeed *= INVADER_SPEEDUP;
        }
        );
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

        const alive = this.invaders.getChildren() as Invader[];
        if (alive.length === 0) return;     // wave cleared (handle later)

        // move all invaders
        alive.forEach((inv) => inv.setVelocityX(this.invaderDir * this.invaderSpeed));

        // did any invader reach a side edge?
        const left = Math.min(...alive.map((i) => i.x));
        const right = Math.max(...alive.map((i) => i.x));
        if ((this.invaderDir === 1 && right > 780) || (this.invaderDir === -1 && left < 20))
        {
            this.invaderDir *= -1;
            alive.forEach((inv) => { inv.y += INVADER_STEP_DOWN; });
        }

        // game over if they reach the player
        if (Math.max(...alive.map((i) => i.y)) > this.player.y - 20) {
        // TODO: switch to the game over scene
        }
    }
}