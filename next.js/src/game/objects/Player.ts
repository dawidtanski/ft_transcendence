import Phaser from "phaser";
import { PLAYER_SPEED } from "../config";

export default class Player extends Phaser.GameObjects.Rectangle {
  lives = 3;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 30, 16, 0x145c17);
    scene.add.existing(this);
  }

  moveLeft()  { this.x = Math.max(15, this.x - PLAYER_SPEED); }
  moveRight() { this.x = Math.min(785, this.x + PLAYER_SPEED); }
}