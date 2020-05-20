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
