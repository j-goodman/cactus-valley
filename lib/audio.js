window.game = window.game ? window.game : {}

let loadAudio = () => {
    game.soundLibrary = {}
    game.soundLibrary['door_sound'] = document.getElementById('door_sound');
    game.soundLibrary['water_drop'] = document.getElementById('water_drop');
    game.soundLibrary['water_fill_long'] = document.getElementById('water_fill_long');
    game.soundLibrary['water_fill_short'] = document.getElementById('water_fill_short');
}

game.playAudio = (file) => {
    if (!game.soundLibrary[file]) {
        console.log(`ERROR: No audio file ${file}.`)
        return false
    }
    // game.soundLibrary[file].currentTime = 0
    game.soundLibrary[file].play()
}
