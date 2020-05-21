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
        if (!game.grid[-2][2].entities.length) {
            let safetyCactus = new Cactus (-2, 2)
            safetyCactus.drop = [Seed, Seed, Fruit]
        }
        this.pos = {x: 1, y: 4}
        game.cameraLock = false
    }
    this.updateSprite()
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
