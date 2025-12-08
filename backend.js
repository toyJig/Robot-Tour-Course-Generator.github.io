document.addEventListener('DOMContentLoaded', function() {
let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");
let time = document.getElementById("time");
time.textContent = "Target Time: " + (Math.round(Math.random() * 30) + 50).toString() + " seconds";

//*************SETUP VARIABLES*****************//
//-1 for random generation according to rules

let bottleElement = document.getElementById("bottles");
let gateElement = document.getElementById("gates");
let wallElement = document.getElementById("walls");
// //reset localStorage for testing
if (parseInt(localStorage.getItem("walls") + parseInt(localStorage.getItem("bottles") > 27))){
    localStorage.setItem("bottles", -1);
    localStorage.setItem("gates", -1);
    localStorage.setItem("walls", -1);
}
// Read saved values from localStorage and coerce to numbers. If not present, use the input's current value.
let gateNum = parseInt(localStorage.getItem("gates"), 10);
if (isNaN(gateNum)) gateNum = parseInt(gateElement.value, 10);
let maxWalls = parseInt(localStorage.getItem("walls"), 10);
if (isNaN(maxWalls)) maxWalls = parseInt(wallElement.value, 10);
let bottles = parseInt(localStorage.getItem("bottles"), 10);
if (isNaN(bottles)) bottles = parseInt(bottleElement.value, 10);

bottleElement.value = bottles;
gateElement.value = gateNum;
wallElement.value = maxWalls;

function save() {
    if (parseInt(bottleElement.value) < -1) bottleElement.value = -1;
    if (parseInt(gateElement.value) < -1) gateElement.value = -1;
    if (parseInt(wallElement.value) < -1) wallElement.value = -1;
    if (parseInt(bottleElement.value) > 19) bottleElement.value = 19;
    if (parseInt(gateElement.value) > 19) gateElement.value = 19;
    if (parseInt(wallElement.value) > 30) wallElement.value = 31;
    localStorage.setItem("bottles", bottleElement.value);
    localStorage.setItem("gates", gateElement.value);
    localStorage.setItem("walls", wallElement.value);
}
bottleElement.addEventListener('input', save);
gateElement.addEventListener('input', save);
wallElement.addEventListener('input', save);

let attempts = 0;
function newTrack() {
    if (attempts > 1000) {
        alert("Could not generate track with given parameters. Please adjust and try again. (-1 for rule-based random generation)");
        return;
    }
    ctx.clearRect(0, 0, c.width, c.height);

    //*************GENERATE TRACK**************/
    let overallArray = [[], [], [], [], [], [], [], [], []]; //9x11
        
    if (gateNum == -1) { gateNum = Math.round(Math.random() * 2) + 4 };
    if (maxWalls == -1) { maxWalls = 10 };
    if (bottles == -1) { 
        bottles = Math.round(Math.random() * 2) + 3; 
        while (bottles > gateNum){
            bottles = Math.round(Math.random() * 2) + 3; 
        }
    }
    bottles = Math.max(0, Math.min(bottles, 31-maxWalls)); //ensure bottles + walls <= 31
    let count = 0;
    //iterates only wall and bottle spaces
    for (let i = 0; i < maxWalls + bottles; i++) {
        let x = Math.floor(Math.random() * 9) + 1;
        let y = Math.floor(Math.random() * 7) + 1;
        while (((x % 2 != 1 && y % 2 != 1) || ((x % 2 != 0 && y % 2 != 0))) || overallArray[y][x]) {
            x = Math.floor(Math.random() * 9) + 1;
            y = Math.floor(Math.random() * 7) + 1;
        }
        if (count < maxWalls) {                             //make walls = 1
            overallArray[y][x] = 1
        } else if (count < maxWalls + bottles) {            // make bottles = 2
            overallArray[y][x] = 2
        }
        count += 1;
    }
    //iterates only middle spaces
    count = 0;
    for (let i = 0; i < gateNum + 1; i++) {
        let x = Math.floor(Math.random() * 9) + 1;
        let y = Math.floor(Math.random() * 7) + 1;
        while (x % 2 == 0 || y % 2 == 0 || overallArray[y][x]) {
            x = Math.floor(Math.random() * 9) + 1;
            y = Math.floor(Math.random() * 7) + 1;
        }
        if (count < gateNum) {                              //make gates = 4
            overallArray[y][x] = 4
            // console.log("gate at " + x + "," + y);
        } else {                                            // make end = 5
            overallArray[y][x] = 5
        }
        count += 1;
    }

    //make start point = 3
    let startX = 0;
    let startY = 0;
    if (Math.round(Math.random()) == 0) {
        startX = Math.round(Math.random() * 4) * 2 + 1;
        startY = Math.round(Math.random()) * 8;
    } else {
        startX = Math.round(Math.random()) * 10;
        startY = Math.round(Math.random() * 3) * 2 + 1
    }
    overallArray[startY][startX] = 3; //ensure start point is on edge

    // console.log(overallArray);

    // *************ENSURE POSSIBILITY**************/
    let bottlesFound = 0;
    let gatesFound = 0;
    let endFound = false;
    let checkedSpots = [];
    checkSpot = function (xCheck, yCheck) {
        // console.log("checking " + xCheck + "," + yCheck);
        if (xCheck < 1 || xCheck > 9 || yCheck < 1 || yCheck > 7) {
            return false; //out of bounds
        }
        if (overallArray[yCheck][xCheck] == 1) {
            // console.log("wall at " + xCheck + "," + yCheck);
            return false; //wall
        }
        // console.log("not wall at " + xCheck + "," + yCheck);
        return true; //not wall
    }
    explore = function (xPos, yPos) {
        if (checkedSpots.includes("" + xPos + " " + yPos)) {
            // console.log("already checked " + xPos + "," + yPos);
            return; //already checked
        }
        if (overallArray[yPos][xPos] == 2) {
            bottlesFound += 1;
        }
        if (overallArray[yPos][xPos] == 5) {
            // console.log("end found at " + xPos + "," + yPos);
            endFound = true;
        }
        if (overallArray[yPos][xPos] == 4) {
            // console.log("gate found at " + xPos + "," + yPos);
            gatesFound += 1;
        }
        if (bottlesFound >= bottles && endFound && gatesFound >= gateNum) {
            return; //all found
        }
        checkedSpots.push("" + xPos + " " + yPos);

        if (checkSpot(xPos, yPos + 1) && xPos % 2 == 1) { //down
            explore(xPos, yPos + 1);
        }
        if (checkSpot(xPos, yPos - 1) && xPos % 2 == 1) { //up
            explore(xPos, yPos - 1);
        }
        if (checkSpot(xPos - 1, yPos) && yPos % 2 == 1) { //left
            explore(xPos - 1, yPos);
        }
        if (checkSpot(xPos + 1, yPos) && yPos % 2 == 1) { //right
            explore(xPos + 1, yPos);
        }
        return;
    }

    if (startX == 0) { startX = 1 };
    if (startX == 10) { startX = 9 };
    if (startY == 0) { startY = 1 };
    if (startY == 8) { startY = 7 };
    // console.log("starting explore at " + startX + "," + startY);
    explore(startX, startY);
    // console.log("bottles found: " + bottlesFound + " out of " + bottles);
    // console.log("end found: " + endFound);
    if (bottlesFound < bottles || !endFound || gatesFound < gateNum) {
        // console.log("Regenerating track...");
        attempts += 1;
        newTrack();
        return;
    }

    //*************DRAW STUFF*****************//
    //*****draw gates based on array*****
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 11; j++) {
            if (overallArray[i][j] == 4) { //draw gates
                        ctx.strokeStyle = "LimeGreen";
                        ctx.lineWidth = 5;
                        ctx.strokeRect(j * 50 + ctx.lineWidth - 50, i * 50 + ctx.lineWidth - 50, 100, 100);
                    }
        }
    }
    //*****draw walls, bottles, end and start based on overall array*****
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 11; j++) {
            if (overallArray[i][j] == 1) { // draw walls
                // console.log("wall at " + i + "," + j);
                ctx.fillStyle = "Tan";
                ctx.strokeStyle = "Black";
                ctx.lineWidth = 1;
                if (i % 2 == 0 && j % 2 == 1) {
                    // console.log("h wall at " + i + "," + j);
                    //horizontal wall
                    ctx.fillRect(j * 50 - 50 + 9.36, i * 50, 100 - 9.36, 10);
                    ctx.strokeRect(j * 50 - 50 + 9.36, i * 50, 100 - 9.36, 10);

                }
                else if (i % 2 == 1 && j % 2 == 0) {
                    // console.log("v wall at " + i + "," + j);
                    //vertical wall
                    ctx.fillRect(j * 50, i * 50 - 50 + 9.36, 10, 100 - 9.36);
                    ctx.strokeRect(j * 50, i * 50 - 50 + 9.36, 10, 100 - 9.36);

                }
            }
            if (overallArray[i][j] == 2) { // draw bottles
                // console.log("bottle at " + i + "," + j);
                ctx.fillStyle = "Blue";
                ctx.strokeStyle = "Black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(j * 50 + 5, i * 50 + 5, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
            if (overallArray[i][j] == 3) { // draw start point
                // console.log("start at x:" + j + ", y:" + i);
                ctx.fillStyle = "Green";
                ctx.strokeStyle = "Black";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(j * 50 + 4, i * 50 + 4, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
            if (overallArray[i][j] == 5) { //draw end point
                ctx.strokeStyle = "Black";
                ctx.lineWidth = 1;
                ctx.fillStyle = "Red";
                ctx.beginPath();
                ctx.arc(j * 50 + 4, i * 50 + 4, 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }
    }
    attempts = 0;
}
newTrack();
});