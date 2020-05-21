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
