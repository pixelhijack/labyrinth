import { MazeBuilder } from './generators.js';

let maze = new MazeBuilder(100, 100);
let laby = maze.maze.map(row => row.map(cell => cell.includes("wall") ? 1 : 0));

const SETTINGS = {
    velocity: 100,
    tileSize: 64,
    tilePerRow: 10,
    tilePerColumn: 10
}

const config = {
    type: Phaser.AUTO,
    width: SETTINGS.tileSize * SETTINGS.tilePerColumn,
    height: SETTINGS.tileSize * SETTINGS.tilePerRow,
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

const level = laby
    .map((row, i) => row.map((cell, j) => {
        if(
            (
                i > 47 && i < 53
            ) && (
                j > 47 && j < 53
            )
        ){
            return 7
        }
        return cell === 0 ? 7 : 5
    }))

const game = new Phaser.Game(config);
let cursors = undefined;
let player = undefined;
let player2 = undefined;
let players = {};
let clientId = undefined;
let light = undefined;

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
        ({ room, playersOfRoom }) => {
            console.log(`new player at room ${room}`, playersOfRoom);
            playersOfRoom.forEach(id => {
                if(!players[id]){
                    players[id] = this.physics.add.sprite(64 * 52 + 32, 64 * 52 + 32, 'hero2').setScale(0.25);
                    this.physics.add.collider(players[id], layer);
                }
            })
        });
    this.socket.on(
        'player name is', 
        ({ id }) => {
            console.log('player name is', id);
            clientId = id;
            players[clientId] = this.physics.add.sprite(64 * 50 + 32, 64 * 50 + 32, 'hero').setScale(0.25);
            const player = players[clientId];
            this.physics.add.collider(player, layer);
            this.cameras.main.startFollow(player);
        });

    const gameEvents = {
        'player move: LEFT': ({id, x}) => players[id] && players[id].body.setVelocityX(-x),
        'player move: RIGHT': ({id, x}) => players[id] && players[id].body.setVelocityX(x),
        'player move: UP': ({id, x}) => players[id] && players[id].body.setVelocityY(-x),
        'player move: DOWN': ({id, x}) => players[id] && players[id].body.setVelocityY(x)
    };
    Object.entries(gameEvents).forEach(([event, callback]) => {
        this.socket.on(event, callback);
    })
    // = this.socket.on('player move: LEFT', (x) => player.body.setVelocityX(-x));

    //const walls = this.add.tileSprite(0, 0, 800, 600, 'walls');
    const tilemap = this.make.tilemap({ 
        data: level,
        tileWidth: SETTINGS.tileSize, 
        tileHeight: SETTINGS.tileSize, 
        width: SETTINGS.tileSize * 10, 
        height: SETTINGS.tileSize * 10 
    });
    const tileset = tilemap.addTilesetImage('walls', null, SETTINGS.tileSize, SETTINGS.tileSize);
    const layer = tilemap.createLayer(0, tileset, 0, 0);
    //player2 = this.physics.add.sprite(64 * 5 + 32, 64 * 5 + 32, 'hero2').setScale(0.25);
    
    // 7 = road tile
    tilemap.setCollisionBetween(1, 6);
    tilemap.setCollisionBetween(8, 9);

    this.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    cursors = this.input.keyboard.createCursorKeys();

    layer.setPipeline('Light2D');
    this.lights.enable();
    this.lights.setAmbientColor(0x000000);

    light = this.lights.addLight(64 * 2 + 32, 64 * 1 + 32, 1000);

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
    const player = players[clientId];
    if(!player){
        return
    }

    //player.body.setVelocity(0);
    Object.values(players).forEach(p => p.body.setVelocity(0));
    light.x = players[clientId].body.x;
    light.y = players[clientId].body.y;

    // Horizontal movement
    if (cursors.left.isDown)
    {
        //player.body.setVelocityX(-100);
        this.socket.emit('player move: LEFT', { x: SETTINGS.velocity })
    }
    else if (cursors.right.isDown)
    {
        //player.body.setVelocityX(100);
        this.socket.emit('player move: RIGHT', { x: SETTINGS.velocity })
    }

    // Vertical movement
    if (cursors.up.isDown)
    {
        //player.body.setVelocityY(-100);
        this.socket.emit('player move: UP', { x: SETTINGS.velocity })
    }
    else if (cursors.down.isDown)
    {
        //player.body.setVelocityY(100);
        this.socket.emit('player move: DOWN', { x: SETTINGS.velocity })
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
        players[clientId].anims.stop();
        //player2.anims.stop();
    }
}