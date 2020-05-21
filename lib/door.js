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
    this.exteriorOrigin = {
        x: x - 3,
        y: y - 3
    }
    game.check(x, y)
    game.grid[x][y].entities.push(this)
    this.addRenderMarkers()
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

Door.prototype.addRenderMarkers = function () {
    let coords = [
        [this.exteriorOrigin.x, this.exteriorOrigin.y],
        [this.exteriorOrigin.x + this.exteriorWidth, this.exteriorOrigin.y],
        [this.exteriorOrigin.x + this.exteriorWidth, this.exteriorOrigin.y + this.exteriorHeight],
        [this.exteriorOrigin.x, this.exteriorOrigin.y + this.exteriorHeight]
    ]
    coords.forEach(coord => {
        let marker = new Entity (coord[0], coord[1])
        marker.name = 'Render Marker'
        marker.drawAction = this.drawAction.bind(this)
        marker.solid = false
        marker.invisible = true
        window.marquis = marker
    })
}
