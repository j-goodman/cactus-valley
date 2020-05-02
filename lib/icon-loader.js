window.addEventListener('load', () => {
    // Load canvas and images
    game.canvas = document.getElementById('canvas')
    game.ctx = game.canvas.getContext('2d')

    game.icons.rock = document.getElementById('rock')
    game.icons.farmer = document.getElementById('farmer')
    game.icons.cliff_a = document.getElementById('cliff_a')
    game.icons.cliff_b = document.getElementById('cliff_b')
    game.icons.cliff_c = document.getElementById('cliff_c')
    game.icons.cliff_d = document.getElementById('cliff_d')
    game.icons.cliff_e = document.getElementById('cliff_e')
    game.icons.cliff_f = document.getElementById('cliff_f')
    game.icons.cliff_g = document.getElementById('cliff_g')
    game.icons.cliff_h = document.getElementById('cliff_h')
    game.icons.cliff_i = document.getElementById('cliff_i')
    game.icons.cliff_j = document.getElementById('cliff_j')
    game.icons.cliff_k = document.getElementById('cliff_k')
    game.icons.cliff_l = document.getElementById('cliff_l')
    game.icons.cliff_m = document.getElementById('cliff_m')
    game.icons.cliff_n = document.getElementById('cliff_n')

    instantiateWorld()
})
