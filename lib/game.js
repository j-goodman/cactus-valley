window.game = window.game ? window.game : {}
game.grid = {}
game.check = (x, y) => {
    game.grid[x] = game.grid[x] ? game.grid[x] : {}
    game.grid[x][y] = game.grid[x][y] ? game.grid[x][y] : new Square (x, y)
}
game.icons = {}
game.intervals = []
game.cursor = null
game.time = 0
game.cameraLock = false

instantiateWorld = () => {
    let fullscreen = document.getElementById('fullscreen');
        fullscreen.onclick = function () {
            if (canvas.mozRequestFullScreen) {
                canvas.mozRequestFullScreen();
            } else if (canvas.webkitRequestFullScreen) {
                canvas.webkitRequestFullScreen();
        }
    }
    loadAudio()
    loadSprites()
    carveCanyon(0, 0, 12, 12)
    buildMapSection(houseSection, 0, 0)

    game.player = new Player (-1, 8)
    game.player.name = 'player'
    game.camera = {
        x: 4,
        y: 5
    }
    game.cameraTarget = {
        x: 4,
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
        game.drawDisplay()
        game.time += 1
    }, 30)
}

let updateCamera = () => {
    if (game.player.pos.x > game.cameraTarget.x + 6) {
        game.cameraTarget.x += 14
    }
    if (game.player.pos.x < game.cameraTarget.x - 7) {
        game.cameraTarget.x -= 14
    }
    if (game.player.pos.y > game.cameraTarget.y + 5) {
        game.cameraTarget.y += 10
    }
    if (game.player.pos.y < game.cameraTarget.y - 4) {
        game.cameraTarget.y -= 10
    }
    if (!game.cameraLock && game.camera.x != game.cameraTarget.x) {
        game.camera.x += game.camera.x < game.cameraTarget.x ? 1 : -1
    }
    if (!game.cameraLock && game.camera.y != game.cameraTarget.y) {
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
    } else if (['x'].includes(event.key)) {
        keyboard.xButton = true
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
    } else if (['x'].includes(event.key)) {
        if (keyboard.xRelease) {
            keyboard.xRelease()
            keyboard.xRelease = null
        }
        keyboard.xButton = false
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

    if (xMove === 1) {
        this.facing = 'right'
    } else if (xMove === -1) {
        this.facing = 'left'
    } else if (yMove === 1) {
        this.facing = 'down'
    } else if (yMove === -1) {
        this.facing = 'up'
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
    if (this.water) {
        this.water -= 1
    }
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
    if (this === game.player) {
        game.player.checkActions()
    }
    return true
}

Entity.prototype.destroy = function () {
    wheels.removeFromArray(game.grid[this.pos.x][this.pos.y].entities, this)
    game.drawGrid(game.camera)
    game.drawDisplay()
    if (this.drops) {
        this.drop(this.drops)
    }
    if (this === game.cursor) {
        game.player.checkActions()
    }
}

Entity.prototype.drop = function (dropItems) {
    let drops = dropItems
    let radius = 1
    let coords = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]]
    coords.forEach(coord => {
        let x = this.pos.x - coord[0]
        let y = this.pos.y - coord[1]
        game.check(x, y)
        if (drops[0] && (!game.grid[x][y].entities[0] || !game.grid[x][y].entities[0].solid)) {
            let Item = drops.pop()
            new Item (x, y)
        }
    })
}

Entity.prototype.checkSurroundings = function (radius) {
    let x = this.pos.x - radius
    let array = []
    for (x = x; x <= this.pos.x + radius; x++) {
        let y = this.pos.y - radius
        for (y = y; y <= this.pos.y + radius; y++) {
            game.check(x, y)
            array = array.concat(game.grid[x][y].entities)
        }
    }
    return array
}

let Item = function (x, y) {
    this.instantiate(x, y)
}
wheels.inherits(Item, Entity)

Item.prototype.interaction = function (subject) {
    subject.addToInventory(this)
    game.playAudio('item_scoop')
    this.destroy()
}

let Cactus = function (x, y) {
    this.solid = true
    this.icon = game.icons.cactus
    this.pos = {
        x: x,
        y: y
    }
    this.drops = wheels.pick([
        [Fruit],
        [Fruit],
        [Fruit],
        [Fruit, Seed],
        [Fruit, Seed, Seed],
        [Seed, Seed],
        [Seed, Seed, Seed],
    ])
    game.check(x, y)
    game.grid[x][y].entities.push(this)
}
wheels.inherits(Cactus, Entity)

Cactus.prototype.interaction = function (subject) {
    game.playAudio('cactus_break')
    subject.water += 30
    subject.water = subject.water > 100 ? 100 : subject.water
    this.destroy()
}

let Fruit = function (x, y) {
    this.name = 'Fruit'
    this.solid = true
    this.icon = game.icons.fruit
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entities.push(this)
}
wheels.inherits(Fruit, Item)

let Seed = function (x, y) {
    this.name = 'Seed'
    this.solid = true
    this.icon = game.icons.seed
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entities.push(this)
}
wheels.inherits(Seed, Item)

let Skeleton = function (x, y) {
    this.solid = true
    this.icon = game.icons.skeleton
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entities.push(this)
}
wheels.inherits(Skeleton, Entity)

let Well = function (x, y) {
    this.solid = true
    this.icon = game.icons.well
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entities.push(this)
}
wheels.inherits(Well, Entity)

Well.prototype.action = function () {
    let surroundings = this.checkSurroundings(1)
    if (surroundings.length) {
        surroundings.forEach(person => {
            if ((person.water || person.water === 0) && person.water < 100) {
                if (person.water < 95) {
                    game.playAudio(person.water < 50 ? 'water_fill_long' : 'water_fill_short')
                }
                person.water += 1
            }
        })
    }
}

let Door = function (x, y) {
    this.name = 'Door'
    this.solid = false
    this.closed = true
    this.exterior = game.icons.house_exterior
    this.exteriorOffset = {
        x: 5,
        y: 1
    }
    this.exteriorWidth = 6
    this.exteriorHeight = 5
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
    this.solid = true
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'Person'
    this.water = 100
}
wheels.inherits(Person, Entity)

Person.prototype.addToInventory = function (item) {
    if (this.inventory[item.name]) {
        this.inventory[item.name] += 1
    } else {
        this.inventory[item.name] = 1
    }
}

let carveCanyon = () => {
    let xMin = 0
    let xMax = 0
    let yMin = 0
    let yMax = 0
    let duration = 5
    let cursor = {
        x: 3,
        y: 5,
        speed: {
            x: 0,
            y: 0,
        },
        elevation: 6,
        radius: 33,
    }
    let radiusMax = 16
    let pathway = []
    radiusMin = 7
    let radiusMovement = -1
    cursor.speed.x = Math.random() * (wheels.flip() ? -1 : 1)
    cursor.speed.y = Math.random()
    while (duration > 0) {
        console.log('Canyoning', duration)
        cursor.radius += wheels.flip() ? radiusMovement : 0
        if (cursor.radius === radiusMax && radiusMovement !== -1) {
            radiusMovement = -1
            radiusMax = 10 + wheels.dice(27)
            cursor.speed.x = 0 * (wheels.flip() ? -1 : 1)
            cursor.speed.y = (duration % 2) ? 0 : 1
            // cursor.speed.x = Math.random() * (wheels.flip() ? -1 : 1)
            // cursor.speed.y = (duration % 2) ? Math.random() : 1
            cursor.elevation -= 1
            // new Well (cursor.x, cursor.y)
            if (!game.grid[cursor.x][cursor.y].entities.length) {
                new Cactus (cursor.x, cursor.y)
            }
            duration -= 1
        }
        if (!wheels.dice(150)) {
            duration -= 1
        }
        if (cursor.radius === radiusMin) {
            radiusMovement = 1
            radiusMin = 7 + wheels.dice(5)
            radiusMax = radiusMax > (radiusMin + 1) ? radiusMax : radiusMin + 3
            narrowPoint = {x: cursor.x, y: cursor.y}
        }
        if (cursor.speed.x > 0) {
            cursor.x += Math.random() < cursor.speed.x ? 1 : 0
        } else if (cursor.speed.x < 0) {
            cursor.x += (0 - Math.random()) > cursor.speed.x ? -1 : 0
        }
        if (cursor.speed.y > 0) {
            cursor.y += Math.random() < cursor.speed.y ? 1 : 0
        } else if (cursor.speed.y < 0) {
            cursor.y += (0 - Math.random()) > cursor.speed.y ? -1 : 0
        }

        pathway.push({x: cursor.x, y: cursor.y})

        // Check for new boundaries
        if ((cursor.x - cursor.radius - 1) < xMin) {
            xMin = cursor.x - cursor.radius - 1
        }
        if ((cursor.x + cursor.radius + 1) > xMax) {
            xMax = cursor.x + cursor.radius + 1
        }
        if ((cursor.y - cursor.radius - 1) < yMin) {
            yMin = cursor.y - cursor.radius - 1
        }
        if ((cursor.y + cursor.radius + 1) > yMax) {
            yMax = cursor.y + cursor.radius + 1
        }

        contourPaint(
            {x: cursor.x, y: cursor.y},
            cursor.radius,
            cursor.elevation >= 0 ? cursor.elevation : 0
        )
    }
    equalizeElevations({
        x: xMin,
        y: yMin
    }, xMax - xMin, yMax - yMin)
    buildContour({
        x: xMin,
        y: yMin
    }, xMax - xMin, yMax - yMin)
    pathway.forEach(coords => {
        let offsets = [[0, 0], [0, 1]]
        offsets.forEach(offset => {
            if (
                game.grid[coords.x + offset[0]][coords.y + offset[1]].entities[0] &&
                game.grid[coords.x + offset[0]][coords.y + offset[1]].entities[0].name === 'Cliff'
            ) {
                let cliff = game.grid[coords.x + offset[0]][coords.y + offset[1]].entities[0]
                switch (
                    cliff.icon.id.split('_').pop()
                ) {
                    case 'c':
                        cliff.icon = game.icons.cliff_o
                        break;
                    case 'a':
                        cliff.icon = game.icons.cliff_q
                        break;
                    case 'b':
                        cliff.icon = game.icons.cliff_p
                        break;
                    case 'e':
                        cliff.icon = game.icons.cliff_s
                        break;
                    case 'f':
                        cliff.icon = game.icons.cliff_t
                        break;
                    case 'h':
                        cliff.icon = game.icons.cliff_u
                        break;
                    case 'g':
                        cliff.icon = game.icons.cliff_v
                        break;
                }
                cliff.solid = false
            }
        })
    })
}

let contourPaint = (origin, radius, elevation) => {
    let x = origin.x - Math.floor(radius / 2)
    game.check(origin.x, origin.y)
    let startingElevation = game.grid[origin.x][origin.y].elevation
    for (x = x; x < origin.x + Math.ceil(radius / 2); x++) {
        let y = origin.y - Math.floor(radius / 2)
        for (y = y; y < origin.y + Math.ceil(radius / 2); y++) {
            if (wheels.distanceBetween(origin, {x: x, y: y}) < radius / 2) {
                game.check(x, y)
                game.grid[x][y].elevation = elevation
            }
        }
    }
}

let equalizeElevations = (origin, width, height) => {
    let x = origin.x
    let y = origin.y
    game.check(origin.x, origin.y)
    let perfect = true
    for (x = origin.x; x < width + 3; x++) {
        let tooLow = false
        let tooHigh = false
        for (y = origin.y; y < height + 3; y++) {
            game.check(x, y)
            let coords = [
                [0, 1], [1, 1], [0, 1], [-1, 1],
                [-1, 0], [-1, -1], [0, -1], [1, -1]
            ]
            coords.forEach(coord => {
                game.check(x + coord[0], y + coord[1])
                let target = game.grid[x][y].elevation
                if (
                    (target -
                    game.grid[x + coord[0]][y + coord[1]].elevation) > 1
                ) {
                    perfect = false
                    tooHigh = true
                    game.grid[x + coord[0]][y + coord[1]].elevation = target - 1
                } else if (
                    (target -
                    game.grid[x + coord[0]][y + coord[1]].elevation) < -1
                ) {
                    perfect = false
                    tooHigh = true
                    game.grid[x + coord[0]][y + coord[1]].elevation = target + 1
                }
                if (tooLow && tooHigh) {
                    coords.forEach(coord => {
                        game.grid[x + coord[0]][y + coord[1]].elevation = target
                    })
                }
            })
        }
    }
    console.log('Equalizing elevations...', perfect)
    if (!perfect) {
        equalizeElevations(origin, width, height)
    }
}

let buildContour = (origin, width, height) => {
    // Place the appropriate cliff formations:
    let x = origin.x
    let y = origin.y
    for (x = 0; x < width + 3; x++) {
        for (y = 0; y < height + 3; y++) {
            let square = []
            let gridX = origin.x + x
            let gridY = origin.y + y
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
        'O': {icon: 'pipewell', solid: false},
        'M': {icon: 'bed_d', solid: true, double: 'floor_molding_k'},
        'N': {icon: 'bed_c', solid: true, double: 'stone_top_b'},
        '=': {entity: Door, double: 'floor'},
        '#': {entity: Cactus},
        '|': {entity: Well},
    },
    section: [
        '             #    ',
        '    KWDDWL        ',
        '    MTTTT%O  #    ',
        '    NX[]X*O   #   ',
        '  | ECC=CF        ',
        '    JIISIG  #     ',
        '     #            ',
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
    this.solid = true
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'barrier'
}
wheels.inherits(Barrier, Entity)

let Cliff = function (x, y) {
    this.name = 'Cliff'
    this.solid = true
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
}
wheels.inherits(Cliff, Entity)

let Player = function (x, y) {
    this.instantiate(x, y)
    this.solid = true
    this.moving = false
    this.betweenness = 0
    this.inventory = {}
    this.speed = 1
    this.facing = 'down'
    this.spriteSet = game.spriteSets.merchant
    this.updateSprite()
    this.name = 'player'
    this.water = 50
}
wheels.inherits(Player, Person)

Player.prototype.action = function () {
    if (this.water <= 0) {
        this.moving = false
        this.facing = 'right'
        this.betweenness = 0
        wheels.removeFromArray(game.grid[this.pos.x][this.pos.y].entities, this)
        game.grid[1][4].entities.push(this)
        if (!game.grid[5][6].entities.length) {
            new Cactus (5, 6)
        }
        this.pos = {x: 1, y: 4}
        game.cameraLock = false
    }
    this.updateSprite()
}

Person.prototype.updateSprite = function () {
    let status = this.moving ? 'run' : 'stand'
    this.facing = this.facing ? this.facing : 'down'
    this.sprite = this.spriteSet[`${status}_${this.facing}`]
    if (!(game.time % (7 - ((this.speed * 2) - 1)))) {
        this.sprite.advance()
    }
}

Player.prototype.checkActions = function () {
    let surroundings = []
    let coords = [[0, -1], [-1, 0], [0, 1], [1, 0]]
    coords.forEach(coords => {
        game.check(this.pos.x + coords[0], this.pos.y + coords[1])
        surroundings.push(game.grid[this.pos.x + coords[0]][this.pos.y + coords[1]].entities)
    })
    surroundings = surroundings.flat()

    let interacted = null
    surroundings.forEach(object => {
        if (object.interaction) {
            interacted = object
        }
    })
    game.cursor = interacted
}

let Square = function (x, y) {
    this.pos = {
        x: x, y: y
    }
    this.entities = []
    this.moisture = Math.random() / 10
    this.elevation = 7
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
                if (game.grid[x][y].elevation > game.showElevation) {
                      game.ctx.fillStyle = `rgba(40, 0, 40, 1)`
                }
                if (game.grid[x][y].elevation < game.showElevation) {
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
    let actions = []
    let drawEntities = entity => {
        let relX = entity.relX
        let relY = entity.relY
        if (entity.moving) {
            let xDraw = (relX * 100) - (entity.direction.x * 100 * (1 - entity.betweenness / 14))
            let yDraw = (relY * 100) - (entity.direction.y * 100 * (1 - entity.betweenness / 14))
            if (entity.icon) {
                game.ctx.drawImage(entity.icon, xDraw, yDraw, entity.icon.width / 2, entity.icon.height / 2)
            } else if (entity.sprite) {
                entity.sprite.draw(xDraw, yDraw, entity.sprite.size)
            } else {
                console.log('ERROR: No icon or sprite found for entity:', entity)
            }
        } else {
            if (entity.icon) {
                game.ctx.drawImage(entity.icon, relX * 100, relY * 100, entity.icon.width / 2, entity.icon.height / 2)
            } else if (entity.sprite) {
                entity.sprite.draw(relX * 100, relY * 100, entity.sprite.size)
            } else {
                console.log('ERROR: No icon or sprite found for entity:', entity)
            }
        }
        if (entity.action) {
            actions.push(entity)
        }
        if (entity.drawAction) {
            actions.push(entity)
        }
    }

    entities.sort((a, b) => {
        return (a.pos.y > b.pos.y) ? 1 : -1
    })
    entities.filter(ent => { return !ent.solid }).forEach(drawEntities)
    entities.filter(ent => { return ent.solid }).forEach(drawEntities)
    actions.forEach(entity => {
        if (entity.drawAction) {
            entity.drawAction()
        }
        if (entity.action) {
            entity.action()
        }
    })
}

game.drawDisplay = () => {
    let icon = game.player.water > 40 ? game.icons.water_meter : (
        Math.floor(game.time / 10) % 2 ? game.icons.water_meter_alert : game.icons.water_meter
    )
    game.ctx.fillStyle = 'rgba(10, 60, 230, .3)';
    game.ctx.fillRect(70, 45, 625 * game.player.water / 100, 34);
    game.ctx.drawImage(
        icon,
        30,
        20,
        icon.width / 1.5,
        icon.height / 1.5
    )
    if (game.cursor) {
        icon = keyboard.xButton ? game.icons.x_button_down : game.icons.x_button_up
        let displayY = game.cursor.relY === 0 ? 0.75 : game.cursor.relY
        game.ctx.drawImage(
            icon,
            (game.cursor.relX) * 100 + 5,
            (displayY - 1) * 100 + 25,
            icon.width / 2.25,
            icon.height / 2.25
        )
        if (keyboard.xButton) {
            keyboard.xRelease = game.cursor.interaction.bind(game.cursor, game.player)
        }
    }
}
