window.game = window.game ? window.game : {}

let loadAudio = () => {
    game.soundLibrary = {}
    game.soundLibrary['door_sound'] = document.getElementById('door_sound');
    game.soundLibrary['footstep_on_wood'] = document.getElementById('footstep_on_wood');
}

game.playAudio = (file) => {
    if (!game.soundLibrary[file]) {
        console.log(`ERROR: No audio file ${file}.`)
        return false
    }
    // game.soundLibrary[file].currentTime = 0
    game.soundLibrary[file].play()
}
