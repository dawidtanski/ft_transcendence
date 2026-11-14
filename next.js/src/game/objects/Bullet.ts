import Phaser from "phaser";
import { GAME_CONFIG } from "../config";
import Player from "../objects/Player";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "star");   // "bullet" is a texture key you load or generate
  }

  fire(x: number, y: number, velocityY: number) {
    this.enableBody(true, x, y, true, true);  // reset and reactivate
    this.setVelocityY(velocityY);             // negative = up (negative number)
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.y < -10 || this.y > 650) {
      this.disableBody(true, true);           // hide it and turn physics off, but keep it for reuse
    }
  }
}