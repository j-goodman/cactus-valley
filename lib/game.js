window.game = window.game ? window.game : {}
game.grid = {}
game.check = (x, y) => {
    game.grid[x] = game.grid[x] ? game.grid[x] : {}
    game.grid[x][y] = game.grid[x][y] ? game.grid[x][y] : new Square (x, y)
}
game.icons = {}
game.intervals = []

instantiateWorld = () => {
    loadAudio()
    buildContour()
    buildMapSection(houseSection, 0, 0)

    game.grid[29][24].entities = []
    let cliffGap = new Cliff (29, 24)
    cliffGap.icon = game.icons['cliff_q']
    cliffGap.solid = false

    game.grid[9][24].entities = []
    cliffGap = new Cliff (9, 24)
    cliffGap.icon = game.icons['cliff_p']
    cliffGap.solid = false

    game.player = new Player (-1, 8)
    game.player.name = 'player'
    game.camera = {
        x: 1,
        y: 5
    }
    game.cameraTarget = {
        x: 1,
        y: 5
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
    this.solid = true
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entities.push(this)
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

    let currentSquare = game.grid[x][y]
    if (!checkMobility(currentSquare, game.grid[x][y + dir.y])) {
        dir.y = 0
    }

    if (!checkMobility(currentSquare, game.grid[x + dir.x][y])) {
        dir.x = 0
    }

    if (dir.x && dir.y && !checkMobility(currentSquare, game.grid[x + dir.x][y + dir.y])) {
        dir.x = 0
    }

    if (dir.x == 0 && dir.y == 0) {
        return false
    }

    this.moving = true
    wheels.removeFromArray(game.grid[x][y].entities, this)
    game.grid[x + dir.x][y + dir.y].entities.push(this)
    this.pos = {
        x: x + dir.x,
        y: y + dir.y
    }
    if (
      game.grid[x][y].entities[0] && game.grid[x][y].entities[0].playerLeave ||
      game.grid[x][y].entities[1] && game.grid[x][y].entities[1].playerLeave
    ) {
      if (game.grid[x][y].entities[0].playerLeave) {
        game.grid[x][y].entities[0].playerLeave(dir.x, dir.y)
      } else {
        game.grid[x][y].entities[1].playerLeave(dir.x, dir.y)
      }
    }
    x = this.pos.x
    y = this.pos.y
    if (
          game.grid[x][y].entities[0] && game.grid[x][y].entities[0].playerEnter ||
          game.grid[x][y].entities[1] && game.grid[x][y].entities[1].playerEnter
      ) {
          if (game.grid[x][y].entities[0].playerEnter) {
              game.grid[x][y].entities[0].playerEnter(dir.x, dir.y)
          } else {
              game.grid[x][y].entities[1].playerEnter(dir.x, dir.y)
          }
    }
    return true
}

let Door = function (x, y) {
    this.solid = false
    this.closed = true
    this.exterior = game.icons.house_exterior
    this.exteriorOffset = {
        x: 5,
        y: 1
    }
    this.icon = game.icons.door
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entities.push(this)
}
wheels.inherits(Door, Entity)

Door.prototype.playerEnter = function (x, y) {
    if (y === -1) {
        game.playAudio('door_sound')
        this.closed = false
        this.icon = game.icons.empty
    }
}

Door.prototype.playerLeave = function (x, y) {
    if (y === 1) {
        game.playAudio('door_sound')
        this.closed = true
        this.icon = game.icons.door
    }
}

Door.prototype.drawAction = function () {
    if (this.closed) {
        game.ctx.drawImage(this.exterior, (this.pos.x - game.camera.x + this.exteriorOffset.x) * 100, (this.pos.y - game.camera.y + this.exteriorOffset.y) * 100, 600, 500)
    }
}

let checkMobility = (a, b) => {
    // Check whether an object can move between square a and square b
    if ((b.entities[0] && b.entities[0].solid) || (b.entities[1] && b.entities[1].solid)) {
        return false
    } else if (
            (b.entities[0] && !b.entities[0].solid && !b.entities[1] && b.entities[0].blocking) ||
            (a.entities[0] && !a.entities[0].solid && a.entities[0].blocking)
        ) {
        let vector = {
            x: b.pos.x - a.pos.x,
            y: b.pos.y - a.pos.y
        }
        let aBlocking = a.entities[0] ? a.entities[0].blocking : false
        let bBlocking = b.entities[0] ? b.entities[0].blocking : false
        if (vector.x === 1 && ((bBlocking && b.entities[0].blocking[3]) || (aBlocking && a.entities[0].blocking[1]))) {
            return false
        }
        if (vector.x === -1 && ((bBlocking && b.entities[0].blocking[1]) || (aBlocking && a.entities[0].blocking[3]))) {
            return false
        }
        if (vector.y === 1 && ((bBlocking && b.entities[0].blocking[0]) || (aBlocking && a.entities[0].blocking[2]))) {
            return false
        }
        if (vector.y === -1 && ((bBlocking && b.entities[0].blocking[2]) || (aBlocking && a.entities[0].blocking[0]))) {
            return false
        }
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

let buildContour = () => {
    let contourMap = [
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
        '00011111111111111111111110000000',
        '00111122221111111111111111000000',
        '00111222221111111111111111100000',
        '00011122222222211111111111110000',
        '00011111222333211222211111100000',
        '00111111112233211221111111100000',
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
        '00000000111111110000000000000000',
        '00000111110000011000000000000111',
        '00000111100000001100000000111100',
        '00000111000000001111100011100000',
        '00000010000000000111110000000000',
        '00000010000000000000110000000000',
        '00000011000000000000011000000000',
        '00000001000000000000011100000000',
        '00000001100000000000111100000000',
        '00000000111100000011111000000000',
        '00000000000111100000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000000000000000000000000',
        '00000000000111111111100000000000',
        '00000000001122222222110000000000',
        '00000000011123333332211111000000',
        '00000000011123444433210001110000',
        '00000001111223455433210000011110',
        '00011111111123444432210000000000',
        '00000000001123333332211000000000',
        '00000000000122222222111000010000',
        '00000000000111111111100000000000',
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
            let top = false

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
                top = true
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
                top = true
            } else if (sq[5] && sq[8] && !sq[1]) {
                cliff = 'i'
                top = true
            }

            if (cliff) {
                let drop = new Cliff (gridX, gridY)
                drop.icon = game.icons[`cliff_${cliff}`]
                if (top) {
                    drop.solid = false
                    drop.blocking = [true, false, false, false] // top, right, bottom, left
                }
            }
        }
    }
}

let houseSection = {
    key: {
        'K': {icon: 'back_wall_k', solid: true},
        'L': {icon: 'back_wall_l', solid: true},
        'D': {icon: 'back_wall_d', solid: true},
        'W': {icon: 'back_wall_window', solid: true},
        'B': {icon: 'stone_top_b', solid: [false, false, false, true]},
        'A': {icon: 'stone_top_a', solid: [false, true, false, false]},
        'C': {icon: 'stone_top_c', solid: [false, false, true, false]},
        'E': {icon: 'stone_top_e', solid: [false, false, true, true]},
        'F': {icon: 'stone_top_f', solid: [false, true, true, false]},
        'S': {icon: 'stairs', solid: [false, true, false, true]},
        'I': {icon: 'stone_wall_c', solid: true},
        'J': {icon: 'stone_wall_e', solid: true},
        'G': {icon: 'stone_wall_f', solid: true},
        'T': {icon: 'floor_molding_d', solid: false},
        'R': {icon: 'floor_molding_k', solid: [false, false, false, true]},
        'Q': {icon: 'floor_molding_l', solid: [false, true, false, false]},
        'X': {icon: 'floor', solid: false},
        '[': {icon: 'rug_b', solid: false, double: 'floor'},
        ']': {icon: 'rug_folded_a', solid: false, double: 'floor'},
        '%': {icon: 'stove', solid: true, double: 'floor_molding_l'},
        '*': {icon: 'workbench', solid: true, double: 'floor'},
        'M': {icon: 'bed_d', solid: true, double: 'floor_molding_k'},
        'N': {icon: 'bed_c', solid: true, double: 'stone_top_b'},
        '=': {entity: Door, double: 'floor'},
    },
    section: [
        '        ',
        ' KWDDWL ',
        ' MTTTT% ',
        ' NX[]X* ',
        ' ECC=CF ',
        ' JIISIG ',
    ],
}

let buildMapSection = (section, xOrigin, yOrigin) => {
    section.section.forEach((row, y) => {
        for (x = 0; x < section.section[0].length; x++) {
            if (section.key[row[x]]) {
                if (section.key[row[x]].double) {
                  let base = new Barrier (x, y)
                  base.solid = false
                  base.icon = game.icons[section.key[row[x]].double]
                }
                if (section.key[row[x]].entity) {
                    let Entity = section.key[row[x]].entity
                    let square = new Entity (x, y)
                } else {
                    let square = new Barrier (x, y)
                    square.icon = game.icons[section.key[row[x]].icon]
                    if (section.key[row[x]].solid && !section.key[row[x]].solid.length) {
                        square.solid = true
                    } else {
                        square.solid = false
                        if (section.key[row[x]].solid.length) {
                            square.blocking = section.key[row[x]].solid
                        }
                    }
                }
            }
        }
    })
}

let Barrier = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'barrier'
}
wheels.inherits(Barrier, Entity)

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

let Square = function (x, y) {
    this.pos = {
        x: x, y: y
    }
    this.entities = []
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
            game.grid[x][y].entities.forEach((entity, i) => {
                entity.relX = relX
                entity.relY = relY
                entity.layer = i
                entities.push(entity)
            })
            relY++
            y++
        }
        relX++
        x++
    }
    let drawActions = []
    let drawEntities = entity => {
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
            if (entity.icon) {
                game.ctx.drawImage(entity.icon, relX * 100, relY * 100, 100, 100)
            } else {
                console.log('ERROR: No draw icon for entity:', entity)
            }
        }
        if (entity.drawAction) {
            drawActions.push(entity)
        }
    }

    entities.filter(ent => { return !ent.solid }).forEach(drawEntities)
    entities.filter(ent => { return ent.solid }).forEach(drawEntities)
    drawActions.forEach(entity => {
      entity.drawAction()
    })
}
