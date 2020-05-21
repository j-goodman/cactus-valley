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
