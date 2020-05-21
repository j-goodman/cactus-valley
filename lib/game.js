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
        radius: 32,
    }
    let radiusMax = 33
    let pathway = []
    radiusMin = 7
    let radiusMovement = -1
    cursor.speed.x = Math.random() * (wheels.flip() ? -1 : 1)
    cursor.speed.y = 1
    let distance = 0
    while (duration > 0) {
        console.log('Canyoning', duration)
        cursor.radius += wheels.flip() ? radiusMovement : 0
        distance += 1
        if (cursor.radius === radiusMax && radiusMovement !== -1) {
            if (distance > 12) {
                distance = 0
                radiusMovement = -1
                radiusMax = 9 + wheels.dice(27) + wheels.dice(13)
                cursor.speed.x = (.3 + (Math.random() * .7) * (wheels.flip() ? -1 : 1))
                cursor.speed.y = (duration % 2) ? Math.random() : 1
                cursor.elevation -= 1
                if (duration === 1) {
                    new Well (cursor.x, cursor.y)
                } else if (!game.grid[cursor.x][cursor.y].entities.length) {
                    new Cactus (cursor.x, cursor.y)
                }
                duration -= 1
            } else {
                cursor.radius -= radiusMovement * wheels.dice(3)
            }
        }
        if (!(wheels.dice(150) - 1)) {
            duration -= 1
        }
        if (cursor.radius === radiusMin) {
            if (distance > wheels.dice(6) + wheels.dice(6) + 12) {
                distance = 0
                radiusMovement = 1
                radiusMin = 7 + wheels.dice(5)
                if (cursor.elevation < 5) {
                    radiusMin += 4
                }
                radiusMax = radiusMax > (radiusMin + 1) ? radiusMax : radiusMin + 3
                narrowPoint = {x: cursor.x, y: cursor.y}
            } else {
                cursor.radius -= radiusMovement * wheels.dice(3)
            }
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
    console.log('Equalizing elevations...', 'x:', origin.x, 'y:', origin.y, 'w:', width, 'h:', height, perfect)
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
            // 035
            // 146 <-- where '4' is the cursor's position
            // 247
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
            } else if (sq[0] && sq[1] && sq[3] && !sq[5]) {
                cliff = 'h'
            } else if (sq[3] && sq[6] && sq[7] && !sq[5]) {
                cliff = 'g'
            } else if (sq[2] && sq[5] && !sq[3] && !sq[7]) {
                cliff = 'j'
                top = true
            } else if (sq[5] && sq[8] && !sq[1] && !sq[3]) {
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

let buildMapSection = (section, xOrigin, yOrigin) => {
    section.section.forEach((row, y) => {
        for (x = 0; x < section.section[0].length; x++) {
            if (section.key[row[x]]) {
                if (section.key[row[x]].double) {
                  let base = new Barrier (x + xOrigin, y + yOrigin)
                  base.solid = false
                  base.icon = game.icons[section.key[row[x]].double]
                }
                if (section.key[row[x]].entity) {
                    let Entity = section.key[row[x]].entity
                    let square = new Entity (x + xOrigin, y + yOrigin)
                } else {
                    let square = new Barrier (x + xOrigin, y + yOrigin)
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
        if (!entity.invisible) {
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
