//import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 64 * 10,
    height: 64 * 10,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const walls = [
    [9,9,9,9,9,9,9,9,9,9],
    [9,0,0,0,0,0,0,0,0,9],
    [9,1,1,0,1,0,0,1,1,9],
    [9,0,1,1,1,0,1,1,0,9],
    [9,0,1,0,0,0,0,0,0,9],
    [9,0,1,0,1,1,1,0,1,9],
    [9,0,0,0,0,0,1,0,0,9],
    [9,1,1,1,1,0,1,1,0,9],
    [0,0,0,0,0,0,0,0,0,9],
    [9,9,9,9,9,9,9,9,9,9]
];

const level = walls.map(raw => raw.map(cell => cell === 0 ? 7 : 5))

const game = new Phaser.Game(config);
let cursors = undefined;
let player = undefined;

function preload (){
    console.log('[PHASER][Preload]');
    this.load.image('walls', 'tileset-384x256-64x64.jpg');
    this.load.spritesheet('hero', 'hero.png', { 
        frameWidth: 644 / 4, 
        frameHeight: 840 / 4 
    });
}

function create (){
    console.log('[PHASER][Create]');
    //const walls = this.add.tileSprite(0, 0, 800, 600, 'walls');
    const tilemap = this.make.tilemap({ 
        data: level,
        tileWidth: 64, 
        tileHeight: 64, 
        width: 64 * 10, 
        height: 64 * 10 
    });
    const tileset = tilemap.addTilesetImage('walls', null, 64, 64);
    const layer = tilemap.createLayer(0, tileset, 0, 0);
    player = this.physics.add.sprite(64 * 2 + 32, 64 * 1 + 32, 'hero').setScale(0.3)
    cursors = this.input.keyboard.createCursorKeys();
    /*
    const animations = [
        { key: 'walk', frames: [0, 1, 2, 3], frameRate: 10, loop: true }
    ]*/
    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('hero', { start: 1, end: 1 }),
        frameRate: 10
    });
    this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
        frameRate: 10
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('hero', { start: 4, end: 7 }),
        frameRate: 10
    });
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('hero', { start: 8, end: 11 }),
        frameRate: 10
    });
    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('hero', { start: 12, end: 15 }),
        frameRate: 10
    });
}

function update(){
    player.setVelocity(0);

    if (cursors.left.isDown)
    {
        player.setVelocityX(-300);
        player.play({ key: 'left', repeat: 1 });
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(300);
        player.play({ key: 'right', repeat: -1 });
    }

    if (cursors.up.isDown)
    {
        player.setVelocityY(-300);
        player.play({ key: 'up', repeat: -1 });
    }
    else if (cursors.down.isDown)
    {
        player.setVelocityY(300);
        player.play({ key: 'down', repeat: -1 });
    }
}