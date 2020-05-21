window.game = window.game ? window.game : {}
game.audio = {
    trackOne: null
}

let loadAudio = () => {
    game.soundLibrary = {}
    game.soundLibrary['door_sound'] = document.getElementById('door_sound');
    game.soundLibrary['cactus_break'] = document.getElementById('cactus_break');
    game.soundLibrary['wood_hit'] = document.getElementById('wood_hit');
    game.soundLibrary['item_scoop'] = document.getElementById('item_scoop');
    game.soundLibrary['water_drop'] = document.getElementById('water_drop');
    game.soundLibrary['water_fill_long'] = document.getElementById('water_fill_long');
    game.soundLibrary['water_fill_short'] = document.getElementById('water_fill_short');
}

game.playAudio = (file) => {
    if (!game.soundLibrary[file]) {
        console.log(`ERROR: No audio file ${file}.`)
        return false
    }
    if (game.audio.trackOne) {
        return false
    }
    game.audio.trackOne = game.soundLibrary[file]
    // game.soundLibrary[file].addEventListener('ended', function () {
    //     this.currentTime = 0
    //     game.audio.trackOne = null
    // })
    setTimeout(() => {
        game.audio.trackOne = null
    }, 200 + wheels.dice(300))
    game.soundLibrary[file].play()
}
