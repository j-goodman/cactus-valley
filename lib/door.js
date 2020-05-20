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
