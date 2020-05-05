window.game = window.game ? window.game : {}

let loadAudio = () => {
    game.soundLibrary = {}
    game.soundLibrary['door_sound'] = document.getElementById('door_sound');
    game.soundLibrary['door_sound'].load()
}

game.playAudio = (file) => {
    if (!game.soundLibrary[file]) {
        console.log(`ERROR: No audio file ${file}.`)
        return false
    }
    // game.soundLibrary[file].currentTime = 0
    if (game.currentSound) {
        game.currentSound.pause()
    }
    game.currentSound = game.soundLibrary[file]
    game.soundLibrary[file].play()
}
