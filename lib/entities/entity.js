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
