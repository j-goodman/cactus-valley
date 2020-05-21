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

Person.prototype.updateSprite = function () {
    let status = this.moving ? 'run' : 'stand'
    this.facing = this.facing ? this.facing : 'down'
    this.sprite = this.spriteSet[`${status}_${this.facing}`]
    if (!(game.time % (7 - ((this.speed * 2) - 1)))) {
        this.sprite.advance()
    }
}
