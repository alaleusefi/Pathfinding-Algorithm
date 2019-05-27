start();

function start() {
    pathStart = null;
    pathEnd = null;
    obstacles = [];
    seaMap = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    if (process.argv.length < 3) {
        console.log('Usage: node ' + "Pathfinding.js" + ' [#input-file#].txt');
        process.exit(1);
    }

    var fs = require('fs')
        , filename = process.argv[2];
    fs.readFile(filename, 'utf8', function (err, inputData) {
        if (err) throw err;
        let inputSplit = inputData.replace(/\s/g, '').split(',');
        parseInput(inputSplit);
    });
};

function parseInput(inputSplit) {
    let validInputSplit = inputSplit.filter(s => s.isValidCoordinate());

    pathStart = validInputSplit[0].parseToCoordinateAs("S");
    pathEnd = validInputSplit[validInputSplit.length - 1].parseToCoordinateAs("E");

    for (var i = 1; i <= validInputSplit.length - 2; i++) {
        obstacles.push(validInputSplit[i].parseToCoordinateAs("X"));
    }
    //Todo: See if the input makes sense in a broad definition
    DetermineRange(obstacles);
}

DetermineRange = function (coords) {
    //Todo: Use Math.min like this:
    // minX = Math.min(coords.map(c => parseInt(c.X)));
    // maxX = Math.max(coords.map(c => parseInt(c.X)));
    // minY = Math.min(coords.map(c => parseInt(c.Y)));
    // maxY = Math.max(coords.map(c => parseInt(c.Y)));
    coords.forEach(elem => {
        if (elem.X < seaMap.minX) seaMap.minX = elem.X;
        if (elem.X > seaMap.maxX) seaMap.maxX = elem.X;
        if (elem.Y < seaMap.minY) seaMap.minY = elem.Y;
        if (elem.Y > seaMap.maxY) seaMap.maxY = elem.Y;
    });

    console.log(seaMap);
}

Coordinate = function (x, y, type) {
    this.X = x;
    this.Y = y;
    this.Type = type;
};

String.prototype.isValidCoordinate = function () {
    if (this.startsWith("x") == false)
        return false;

    let yIndex = this.indexOf("y");

    if (yIndex == -1)
        return false;

    let xPart = this.slice(1, yIndex);

    if (/^\d+$/.test(xPart) == false)
        return false;

    let yPart = this.slice(-(this.length - yIndex - 1));

    if (/^\d+$/.test(yPart) == false)
        return false;

    return true;
}

String.prototype.parseToCoordinateAs = function (type) {
    let yIndex = this.indexOf("y");
    let xPart = this.slice(1, yIndex);
    let yPart = this.slice(-(this.length - yIndex - 1));
    return new Coordinate(xPart, yPart, type);
}
