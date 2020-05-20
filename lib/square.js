let Square = function (x, y) {
    this.pos = {
        x: x, y: y
    }
    this.entities = []
    this.moisture = Math.random() / 10
    this.elevation = 7
}
