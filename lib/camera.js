
let updateCamera = () => {
    if (game.player.pos.x > game.cameraTarget.x + 6) {
        game.cameraTarget.x += 14
    }
    if (game.player.pos.x < game.cameraTarget.x - 7) {
        game.cameraTarget.x -= 14
    }
    if (game.player.pos.y > game.cameraTarget.y + 5) {
        game.cameraTarget.y += 10
    }
    if (game.player.pos.y < game.cameraTarget.y - 4) {
        game.cameraTarget.y -= 10
    }
    if (!game.cameraLock && game.camera.x != game.cameraTarget.x) {
        game.camera.x += game.camera.x < game.cameraTarget.x ? 1 : -1
    }
    if (!game.cameraLock && game.camera.y != game.cameraTarget.y) {
        game.camera.y += game.camera.y < game.cameraTarget.y ? 1 : -1
    }
}

let keyboard = {}
