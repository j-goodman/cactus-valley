let Item = function (x, y) {
    this.instantiate(x, y)
}
wheels.inherits(Item, Entity)

Item.prototype.interaction = function (subject) {
    subject.addToInventory(this)
    game.playAudio('item_scoop')
    this.destroy()
}
