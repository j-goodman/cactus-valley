let Sprite = function (image, frames, size=100, offsetX = 0, offsetY = 0) {
    this.image = image
    this.width = this.image.width / frames / 2
    this.frames = frames
    this.frame = 0
    this.size = size
    this.offset = {
        x: offsetX,
        y: offsetY
    }
}

Sprite.prototype.draw = function (x, y, width = 0) {
    width = width ? width : this.image.width
    scale = width / (this.image.width / this.frames)
    game.ctx.drawImage(
        this.image,
        0 + (this.image.width / this.frames * this.frame),
        0,
        this.image.width / this.frames,
        this.image.height,
        x - (this.image.width / this.frames / 2) + 100 + this.offset.x,
        y - (this.image.height * scale) + 100 + this.offset.y,
        this.image.width / this.frames * scale,
        this.image.height * scale
    )
}

Sprite.prototype.advance = function () {
    this.frame += 1
    if (this.frame >= this.frames) {
        this.frame = 0
        return true
    }
    return false
}

let loadSprites = () => {
    game.spriteSets = {}
    let allImages = []

    let merchant_run_up = new Image ()
    let merchant_run_right = new Image ()
    let merchant_run_down = new Image ()
    let merchant_run_left = new Image ()
    let merchant_stand_up = new Image ()
    let merchant_stand_right = new Image ()
    let merchant_stand_down = new Image ()
    let merchant_stand_left = new Image ()
    merchant_run_up.src = 'assets/sprites/merchant_run_up.png'
    merchant_run_right.src = 'assets/sprites/merchant_run_right.png'
    merchant_run_down.src = 'assets/sprites/merchant_run_down.png'
    merchant_run_left.src = 'assets/sprites/merchant_run_left.png'
    merchant_stand_up.src = 'assets/sprites/merchant_stand_up.png'
    merchant_stand_right.src = 'assets/sprites/merchant_stand_right.png'
    merchant_stand_down.src = 'assets/sprites/merchant_stand_down.png'
    merchant_stand_left.src = 'assets/sprites/merchant_stand_left.png'
    allImages.push(merchant_run_up)
    game.spriteSets.merchant = {
        'run_up': new Sprite (merchant_run_up, 6, 132, -14, 0),
        'run_right': new Sprite (merchant_run_right, 6, 132, -14, 0),
        'run_down': new Sprite (merchant_run_down, 6, 132, -14, 0),
        'run_left': new Sprite (merchant_run_left, 6, 132, -14, 0),
        'stand_up': new Sprite (merchant_stand_up, 1, 132, -14, 0),
        'stand_right': new Sprite (merchant_stand_right, 1, 132, -14, 0),
        'stand_down': new Sprite (merchant_stand_down, 1, 132, -14, 0),
        'stand_left': new Sprite (merchant_stand_left, 1, 132, -14, 0),
    }
}
