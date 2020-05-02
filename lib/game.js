window.game = {}
game.grid = {}
game.check = (x, y) => {
    game.grid[x] = game.grid[x] ? game.grid[x] : {}
    game.grid[x][y] = game.grid[x][y] ? game.grid[x][y] : new Square ()
}
game.worldbuilder = {}
game.worldbuilder.clear = (x, y) => {
    game.grid[x][y].entity = null
}
game.icons = {}
game.intervals = []
instantiateWorld = () => {
    // let i = 0
    // while (i < 15) {
    //     let rock = new Cliff (1, 2 + i)
    //     i++
    // }
    // i = 0
    // while (i < 15) {
    //     let rock = new Cliff (16, 2 + i)
    //     i++
    // }
    // let rock = new Cliff (2, 2)
    // rock = new Cliff (15, 15)
    // rock = new Cliff (2, 3)
    // rock = new Cliff (3, 2)
    // game.grid[16][16] = null
    // game.grid[1][2] = null
    // i = 0
    // while (i < 13) {
    //     let rock = new Cliff (4 + i, 2)
    //     i++
    // }
    // i = 0
    // while (i < 14) {
    //     let rock = new Cliff (2 + i, 16)
    //     i++
    // }
    // new Plateau (1, 10, 1, 8)
    // new Plateau (1, -10, 1, 8)
    // new Plateau (16, 10, 1, 8)
    // new Plateau (16, 10, 1, 3)
    // new Plateau (16, -10, 1, 8)
    // new Plateau (-16, 10, 1, 8)
    // new Plateau (-16, -10, 1, 8)
    // new Plateau (-16, -10, 1, 4)
    buildContour()
    let i = -1
    let playerPlaced = false
    while (!playerPlaced) {
        game.check(i, i)
        if (!game.grid[i][i].entity) {
            game.player = new Player (i, i)
            playerPlaced = true
        } else {
            i++
        }
    }
    game.player.name = 'player'
    game.camera = {
        x: game.player.pos.x,
        y: game.player.pos.y
    }
    game.cameraTarget = {
        x: game.player.pos.x,
        y: game.player.pos.y
    }

    game.drawGrid(game.camera)

    let gameInterval = window.setInterval(() => {
        let movement = {
            x: 0,
            y: 0,
        }
        if (keyboard.left) { movement.x -= 1 }
        if (keyboard.up) { movement.y -= 1 }
        if (keyboard.right) { movement.x += 1 }
        if (keyboard.down) { movement.y += 1 }
        if (movement.x || movement.y || game.player.moving) {
            game.player.move(movement.x, movement.y)
        }
        updateCamera()
        game.drawGrid(game.camera)
    }, 30)
}

let updateCamera = () => {
    if (game.player.pos.x > game.camera.x + 6) {
        game.cameraTarget.x += 14
    }
    if (game.player.pos.x < game.camera.x - 7) {
        game.cameraTarget.x -= 14
    }
    if (game.player.pos.y > game.camera.y + 5) {
        game.cameraTarget.y += 10
    }
    if (game.player.pos.y < game.camera.y - 4) {
        game.cameraTarget.y -= 10
    }
    if (game.camera.x != game.cameraTarget.x) {
        game.camera.x += game.camera.x < game.cameraTarget.x ? 1 : -1
    }
    if (game.camera.y != game.cameraTarget.y) {
        game.camera.y += game.camera.y < game.cameraTarget.y ? 1 : -1
    }
}

let keyboard = {}

window.addEventListener('keydown', event => {
    if (['ArrowLeft'].includes(event.key)) {
        keyboard.left = true
    } else if (['ArrowDown'].includes(event.key)) {
        keyboard.down = true
    } else if (['ArrowRight'].includes(event.key)) {
        keyboard.right = true
    } else if (['ArrowUp'].includes(event.key)) {
        keyboard.up = true
    } else if (['z'].includes(event.key)) {
        keyboard.zButton = true
    }
})

window.addEventListener('keyup', event => {
    if (['ArrowLeft'].includes(event.key)) {
        keyboard.left = false
    } else if (['ArrowDown'].includes(event.key)) {
        keyboard.down = false
    } else if (['ArrowRight'].includes(event.key)) {
        keyboard.right = false
    } else if (['ArrowUp'].includes(event.key)) {
        keyboard.up = false
    } else if (['z'].includes(event.key)) {
        keyboard.zButton = false
    }
})

let Entity = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.info = ''
}

let Item = function (x, y) {
    this.instantiate(x, y)
    this.value = 0
}
wheels.inherits(Item, Entity)

Entity.prototype.instantiate = function (x, y) {
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entity = this
}

Entity.prototype.move = function (xMove, yMove) {
    if (this.moving) {
        if (keyboard.zButton) {
            this.speed = 2
        } else {
            this.speed = 1
        }
        let speed = this.speed
        this.betweenness += this.diagonal ? this.speed / 1.4142 : this.speed
        if (this.betweenness < 14) {
            return false
        } else {
            this.diagonal = (!!xMove && !!yMove)
            this.betweenness = 0
            this.moving = false
        }
    }
    this.direction = {
        x: xMove,
        y: yMove
    }
    let dir = this.direction

    let x = this.pos.x
    let y = this.pos.y

    game.check(x + dir.x, y + dir.y)
    game.check(x, y + dir.y)
    game.check(x + dir.x, y)

    if (game.grid[x][y + dir.y].entity) {
        dir.y = 0
    }

    if (game.grid[x + dir.x][y].entity) {
        dir.x = 0
    }

    if (dir.x && dir.y && game.grid[x + dir.x][y + dir.y].entity) {
        dir.x = 0
    }

    if (dir.x == 0 && dir.y == 0) {
        return false
    }

    this.moving = true
    game.grid[x][y].entity = null
    game.grid[x + dir.x][y + dir.y].entity = this
    this.pos = {
        x: x + dir.x,
        y: y + dir.y
    }
    return true
}

let Person = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'person'
}
wheels.inherits(Person, Entity)

let Plateau = function (xOrigin, yOrigin, elevation, size) {
    // game.check(xOrigin, yOrigin)
    // this.elevation = game.grid[xOrigin][yOrigin].elevation + elevation
    // this.squares = []
    //
    // // Raise the squares that will make up the plateau:
    // let maxX = size + wheels.dice(wheels.dice(9))
    // let x = maxX
    // let maxY = size + wheels.dice(wheels.dice(4))
    // let y = maxY
    // while (x >= 0) {
    //     while (y >= 0) {
    //         game.check((xOrigin - Math.floor(maxX/2) + x), (yOrigin - Math.floor(maxY/2) + y))
    //         game.grid[xOrigin - Math.floor(maxX/2) + x][yOrigin - Math.floor(maxY/2) + y].elevation = this.elevation
    //         y--
    //     }
    //     y = maxY
    //     x--
    // }

    // Place the appropriate cliff formations:

}

let buildContour = () => {
    let contourMap = [
        '00000000000000000000000000000000',
        '00011111111111111111111110000000',
        '00111122221111111111111111000000',
        '00111222221111111111111111100000',
        '00011122222222211111111111110000',
        '00011111222333211222211111100000',
        '00001111112233211221111111100000',
        '00000111111222211111111111000000',
        '00000011111111111111111110000000',
        '00000001111111111111111110000000',
        '00000001111122222221111110000000',
        '00000001111222222222211111110000',
        '00001111112221111222222211111000',
        '00011111112221111112222221111000',
        '00011111112222211112222221111000',
        '00000011111222222222221111000000',
        '00000000011111222211111000000000',
        '00000000000001111110000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
    ]

    // Set elevations based on the countour map
    contourMap.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            game.check(x, y)
            game.grid[x][y].elevation = row[x]
        }
    })

    // Place the appropriate cliff formations:
    let x = 0
    let y = 0
    let maxX = contourMap[0].length
    let maxY = contourMap.length
    let xOrigin = 0
    let yOrigin = 0
    for (x = 0; x < maxX + 3; x++) {
        for (y = 0; y < maxY + 3; y++) {
            let square = []
            let gridX = xOrigin + x
            let gridY = yOrigin + y
            for (xi = -1; xi <= 1; xi++) {
                for (yi = -1; yi <= 1 ; yi++) {
                    game.check(gridX + xi, gridY + yi)
                    game.check(gridX, gridY)
                    square.push(Math.floor(game.grid[gridX + xi][gridY + yi].elevation) > Math.floor(game.grid[gridX][gridY].elevation))
                }
            }

            let cliff = null

            // Cliff shape logic:
            let sq = square
            if (sq[1] && sq[3] && sq[5] &&sq[7]) {
                cliff = null
            } else if (sq[4] && sq[3] && ((sq[1]?1:0)+(sq[2]?1:0)+(sq[3]?1:0)+(sq[4]?1:0)) >= 1) {
                cliff = null
            // } else if (((sq[1]?1:0)+(sq[2]?1:0)+(sq[3]?1:0)+(sq[4]?1:0)+(sq[5]?1:0)+(sq[6]?1:0)+(sq[7]?1:0)+(sq[8]?1:0)) >= 5) {
            //     cliff = 'm'
            } else if (sq[8] && !sq[7] && !sq[5] && !(sq[6] && sq[8])) {
                cliff = 'k'
            } else if (sq[2] && !sq[1] && !sq[5] && !(sq[0] && sq[2])) {
                cliff = 'l'
            } else if (sq[6] && !sq[7] && !sq[3] && !(sq[6] && sq[8])) {
                cliff = 'e'
            } else if (sq[0] && !sq[1] && !sq[3] && !(sq[0] && sq[2])) {
                cliff = 'f'
            } else if (sq[5] && !sq[7] && !sq[1] && !sq[0] && !sq[6]) {
                cliff = 'd'
            } else if (sq[7] && !sq[3] && !sq[5]) {
                cliff = 'b'
            } else if ((sq[1] || (sq[0] && sq[2])) && !sq[3] && !sq[5]) {
                cliff = 'a'
            } else if (sq[3] && !sq[1] && !sq[7]) {
                cliff = 'c'
            } else if (sq[0] && sq[1] && sq[3]) {
                cliff = 'h'
            } else if (sq[3] && sq[6] && sq[7]) {
                cliff = 'g'
            } else if (sq[2] && sq[5] && !sq[7]) {
                cliff = 'j'
            } else if (sq[5] && sq[8] && !sq[1]) {
                cliff = 'i'
            }

            if (cliff) {
                let drop = new Cliff (gridX, gridY)
                drop.icon = game.icons[`cliff_${cliff}`]
            }
        }
    }
}

let Cliff = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'cliff'
}
wheels.inherits(Cliff, Entity)

let Player = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.icon = game.icons.farmer
    this.name = 'player'
}
wheels.inherits(Player, Person)

let Square = function () {
    this.entity = null
    this.moisture = Math.random() / 10
    this.elevation = 0
}

game.drawGrid = center => {
    game.ctx.clearRect(0, 0, canvas.width, canvas.height)
    let x = center.x - 8
    let relX = 0
    let entities = []
    while (x <= center.x + 7) {
        let y = center.y - 5
        let relY = 0
        while (y <= center.y + 6) {
            game.check(x, y)
            let moist = game.grid[x][y].moisture
            game.ctx.fillStyle = `rgba(${
                wheels.spectrum(moist, 240, 145)} ${
                wheels.spectrum(moist, 220, 155)} ${
                wheels.spectrum(moist, 170, 80)
            })`
            if (game.showElevation) {
              if (game.grid[x][y].elevation > 1) {
                    game.ctx.fillStyle = `rgba(40, 0, 40, 1)`
              }
              if (game.grid[x][y].elevation < 1) {
                    game.ctx.fillStyle = `rgba(255, 255, 255, 1)`
              }
            }
            game.ctx.fillRect(relX * 100, relY * 100, 100, 100);
            let entity = game.grid[x][y].entity
            if (entity) {
                entity.relX = relX
                entity.relY = relY
                entities.push(entity)
            }
            relY++
            y++
        }
        relX++
        x++
    }
    entities.forEach(entity => {
        let relX = entity.relX
        let relY = entity.relY
        if (entity.moving) {
            game.ctx.drawImage(
                entity.icon,
                (relX * 100) - (entity.direction.x * 100 * (1 - entity.betweenness / 14)),
                (relY * 100) - (entity.direction.y * 100 * (1 - entity.betweenness / 14)),
                100,
                100)
        } else {
            game.ctx.drawImage(entity.icon, relX * 100, relY * 100, 100, 100)
        }
    })
}
