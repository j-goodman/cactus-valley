
window.addEventListener('keydown', event => {
    if (['ArrowLeft'].includes(event.key)) {
        keyboard.left = true
    } else if (['ArrowDown'].includes(event.key)) {
        keyboard.down = true
    } else if (['ArrowRight'].includes(event.key)) {
        keyboard.right = true
    } else if (['ArrowUp'].includes(event.key)) {
        keyboard.up = true
    } else if (['x'].includes(event.key)) {
        keyboard.xButton = true
    } else if (['z'].includes(event.key)) {
        keyboard.zButton = true
    }
})

window.addEventListener('keyup', event => {
    if (['ArrowLeft'].includes(event.key)) {
        keyboard.left = false
    } else if (['ArrowDown'].includes(event.key)) {
        keyboard.down = false
    } else if (['ArrowRight'].includes(event.key)) {
        keyboard.right = false
    } else if (['ArrowUp'].includes(event.key)) {
        keyboard.up = false
    } else if (['x'].includes(event.key)) {
        if (keyboard.xRelease) {
            keyboard.xRelease()
            keyboard.xRelease = null
        }
        keyboard.xButton = false
    } else if (['z'].includes(event.key)) {
        keyboard.zButton = false
    }
})
