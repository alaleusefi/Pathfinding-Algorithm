createGraph = require('./ngraph.graph.min.js');
path = require('./ngraph.path.min.js');
fs = require('fs');

seaMap = {
    pathStart: null,
    pathEnd: null,
    minX: null, minY: null, maxX: null, maxY: null,
    reefs: [],
    waters: []
};

outputData = [];
foundPath = null;
graph = null;
filename = null;
inputSplit = null;

if (process.argv.length < 3) {
    console.log('Usage: node ' + "Pathfinding.js" + ' [#input-file#].txt');
    process.exit(1);
}

readInput();

//Todo: Think about error scenarios
function ProcessData() {
    fillReefs();
    determineRange();
    fillWaters();
    graph = createGraph();
    pupulateGraph();
    findShortestPath();
    generateOutputData();
    generateOutputFile();
}

function generateOutputFile() {
    let outputText = "";
    outputData.forEach(row => {
        outputText += row.join("") + "\r\n";
    });
    fs.writeFile("./" + filename + ".answer", outputText, function () { console.log("done") });
}

function generateOutputData() {
    for (var y = seaMap.minY; y <= seaMap.maxY; y++) {
        outputData.push([]);
        for (var x = seaMap.minX; x <= seaMap.maxX; x++)
            if (seaMap.reefs.find(c => c.X == x && c.Y == y) != undefined)
                outputData[y - seaMap.minY].push('x');
            else if (seaMap.pathStart.X == x && seaMap.pathStart.Y == y)
                outputData[y - seaMap.minY].push('S');
            else if (seaMap.pathEnd.X == x && seaMap.pathEnd.Y == y)
                outputData[y - seaMap.minY].push('E');
            else if (foundPath.find(o => o.id.parseToCoordinateAs('O').X == x && o.id.parseToCoordinateAs('O').Y == y) != undefined)
                outputData[y - seaMap.minY].push('O');
            else outputData[y - seaMap.minY].push('.');
    }
}

function findShortestPath() {
    let pathFinder = path.aStar(graph);
    let startNodeId = 'x' + seaMap.pathStart.X + 'y' + seaMap.pathStart.Y;
    let endNodeId = 'x' + seaMap.pathEnd.X + 'y' + seaMap.pathEnd.Y;
    foundPath = pathFinder.find(startNodeId, endNodeId);

    if (foundPath.length == 0) {
        outputData = [["error"], ["path doesn't exist!"]];
        generateOutputFile();
        process.exit(1);
    }
}

function pupulateGraph() {
    for (var x = seaMap.minX; x <= seaMap.maxX; x++)
        for (var y = seaMap.minY; y <= seaMap.maxY; y++) {
            if (seaMap.reefs.find(c => c.X == x && c.Y == y) != undefined)
                continue;
            let currentNodeId = 'x' + x + 'y' + y;
            graph.addNode(currentNodeId, ".");

            let leftNeighbourId = 'x' + (x - 1) + 'y' + y;
            let leftNeighbour = graph.hasNode(leftNeighbourId);
            if (leftNeighbour != undefined)
                graph.addLink(currentNodeId, leftNeighbourId);

            let upNeighbourId = 'x' + x + 'y' + (y - 1);
            let upNeighbour = graph.hasNode(upNeighbourId);
            if (upNeighbour != undefined)
                graph.addLink(currentNodeId, upNeighbourId);
        }
}

function readInput() {
    filename = process.argv[2];
    fs.readFile(filename, 'utf8', function (err, inputData) {
        if (err) throw err;
        inputSplit = inputData.replace(/\s/g, '').split(',');
        ProcessData();
    });
}

function fillReefs() {
    validInputSplit = inputSplit.filter(s => s.isValidCoordinate());

    for (var i = 1; i <= validInputSplit.length - 2; i++) {
        seaMap.reefs.push(validInputSplit[i].parseToCoordinateAs("X"));
    }
    //Todo: See if the input makes sense in a broad definition
}

determineRange = function () {
    seaMap.minX = seaMap.reefs[0].X;
    seaMap.maxX = seaMap.reefs[0].X;
    seaMap.minY = seaMap.reefs[0].Y;
    seaMap.maxY = seaMap.reefs[0].Y;

    seaMap.reefs.forEach(elem => {
        if (elem.X < seaMap.minX) seaMap.minX = elem.X;
        if (elem.X > seaMap.maxX) seaMap.maxX = elem.X;
        if (elem.Y < seaMap.minY) seaMap.minY = elem.Y;
        if (elem.Y > seaMap.maxY) seaMap.maxY = elem.Y;
    });
}

fillWaters = function () {
    seaMap.pathStart = validInputSplit[0].parseToCoordinateAs("S");
    seaMap.pathEnd = validInputSplit[validInputSplit.length - 1].parseToCoordinateAs("E");

    if (seaMap.pathStart.isInRange(seaMap.minX, seaMap.maxX, seaMap.minY, seaMap.maxY) == false) {
        console.log("Start point falls out of the map extent");
        outputData = [["error"], ["cannot navigate outside map extent!"]];
        generateOutputFile();
        process.exit(1);
    }

    if (seaMap.pathEnd.isInRange(seaMap.minX, seaMap.maxX, seaMap.minY, seaMap.maxY) == false) {
        console.log("End point falls out of the map extent");
        outputData = [["error"], ["cannot navigate outside map extent!"]];
        generateOutputFile();
        process.exit(1);
    }

    for (var x = seaMap.minX; x <= seaMap.maxX; x++)
        for (var y = seaMap.minY; y <= seaMap.maxY; y++) {

            if (seaMap.reefs.find(c => c.X == x && c.Y == y) != undefined)
                continue;
            if (x == seaMap.pathStart.X && y == seaMap.pathStart.Y)
                continue;
            if (x == seaMap.pathEnd.X && y == seaMap.pathEnd.Y)
                continue;
            seaMap.waters.push(new Coordinate(x, y, "."));
        }
};

Coordinate = function (x, y, type) {
    this.X = x;
    this.Y = y;
    this.Type = type;
    this.isInRange = function (minX, maxX, minY, maxY) {
        if (this.X < minX) return false;
        if (this.X > maxX) return false;
        if (this.Y < minY) return false;
        if (this.Y > maxY) return false;
        return true;
    }
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
