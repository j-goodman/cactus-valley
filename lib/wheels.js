let wheels = {}

wheels.inherits = function (ChildClass, BaseClass) {
    function Surrogate() { this.constructor = ChildClass }
    Surrogate.prototype = BaseClass.prototype
    ChildClass.prototype = new Surrogate()
};

wheels.spectrum = (place, first, second) => {
    // If place = 0, return first, if place = 1, return second,
    // if place = .5 return the mean of the two, etc.
    return (first * (1 - place)) + (second * place)
}

wheels.distanceBetween = (first, second) => {
    let a = first.x - second.x
    let b = first.y - second.y
    return Math.sqrt(a * a + b * b)
}

wheels.pick = list => {
    if (Array.isArray(list)) {
        return list[Math.floor(Math.random() * list.length)]
    } else if (Object.keys(list)) {
        return list[wheels.pick(Object.keys(list))]
    }
}

wheels.removeFromArray = (array, target) => {
    array.forEach((item, i) => {
        if (item === target) {
            array.splice(i, 1)
        }
    })
}

wheels.dice = sides => {
    return 1 + Math.floor(Math.random() * sides)
}

wheels.floor = (val, floor) => {
    return val > floor ? val : floor
}

wheels.ceiling = (val, ceiling) => {
    return val < ceiling ? val : ceiling
}

wheels.angleBetween = (first, second) => {
    return Math.atan2(second.y - first.y, second.x - first.x) * 180 / Math.PI
}
