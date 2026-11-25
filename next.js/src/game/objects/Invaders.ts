import Phaser from 'phaser';

export default class Invader extends Phaser.Physics.Arcade.Sprite {
    points: number = 10;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "star");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
    }
}