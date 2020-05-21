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
