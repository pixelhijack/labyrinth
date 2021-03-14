import { MazeBuilder } from './generators.js';

let maze = new MazeBuilder(100, 100);
let laby = maze.maze.map(row => row.map(cell => cell.includes("wall") ? 1 : 0));

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

let state = {}

const updateState = (event, newState) => {
    console.log(event, newState);
    state = {
        ...state,
        ...newState
    }
}

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

const level = laby.map(raw => raw.map(cell => cell === 0 ? 7 : 5))

const game = new Phaser.Game(config);
let cursors = undefined;
let player = undefined;
let player2 = undefined;

function preload (){
    console.log('[PHASER][Preload]');
    this.load.image('walls', 'tileset-384x256-64x64.jpg');
    this.load.spritesheet('hero', 'hero.png', { 
        frameWidth: 644 / 4, 
        frameHeight: 840 / 4 
    });
    this.load.spritesheet('hero2', 'hero2.png', { 
        frameWidth: 644 / 4, 
        frameHeight: 840 / 4 
    });
}

function create (){
    console.log('[PHASER][Create]');

    // SOCKET.io
    this.socket = io();
    this.socket.emit('user joined room', {
        roomId: location.pathname.length && location.pathname.split('/') && location.pathname.split('/')[1]
    })
    this.socket.on(
        'new player', 
        ({ room, players }) => updateState('new player', { room, players })
    )

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
    player = this.physics.add.sprite(64 * 2 + 32, 64 * 1 + 32, 'hero').setScale(0.25);
    player2 = this.physics.add.sprite(64 * 5 + 32, 64 * 5 + 32, 'hero2').setScale(0.25);
    this.physics.add.collider(player, layer);
    
    // 7 = road tile
    tilemap.setCollisionBetween(1, 6);
    tilemap.setCollisionBetween(8, 9);

    this.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    this.cameras.main.startFollow(player);

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
    player.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-100);
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(100);
    }

    // Vertical movement
    if (cursors.up.isDown)
    {
        player.body.setVelocityY(-100);
    }
    else if (cursors.down.isDown)
    {
        player.body.setVelocityY(100);
    }

    // Update the animation last and give left/right animations precedence over up/down animations
    if (cursors.left.isDown)
    {
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.anims.play('right', true);
    }
    else if (cursors.up.isDown)
    {
        player.anims.play('up', true);
    }
    else if (cursors.down.isDown)
    {
        player.anims.play('down', true);
    }
    else
    {
        player.anims.stop();
        player2.anims.stop();
    }
}