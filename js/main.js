'use strict';
var gEasy = {
    SIZE: 4,
    MINES: 2
};
var gMedium = {
    SIZE: 8,
    MINES: 12
};
var gHard = {
    SIZE: 12,
    MINES: 30
};
var gBoard;
var gLevel = {
};
var gGame = {
    isOn: false,
    shownCount: 0, markedCount: 0, secsPassed: 0
}
const MINE = '💣';
const FLAG = '<img class="flag" src="img/flag.png">';
var gStopWatchInterval;
var gTimeElapsed = '0:00.000';
var livesCount = 3;
var livesDisplay = '<img class="heart" src="img/life-1.png">';


function init(level) {
    gLevel = level
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
    gLevel = {};
    updateLives();
}
function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
    // board[0][1].isMine = true;
    // board[2][2].isMine = true;
    getRandomMines(board, gLevel.MINES);
    setMinesNegsCount(board);
    console.table(board)
    return board;
}
function renderBoard(board) {
    var strHTML = '';
    // var cell = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j });
            strHTML += '\t<td class="' + cellClass + '"  onclick="cellClicked(this, ' + i + ', ' + j + ')" oncontextmenu="return false" onmousedown="cellClicked(this, ' + i + ', ' + j + ')" >\n';

            if (currCell.isMine === true && currCell.isShown) {
                strHTML += MINE;
                // } else if (currCell.isShown && currCell.minesAroundCount === 0) {
                //     strHTML += ' ';
            } else if (currCell.isShown) {
                strHTML += currCell.minesAroundCount;
            } else if (currCell.isMarked === true) {
                strHTML += FLAG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            var cellPos = { i: i, j: j };
            countMines(board, cellPos, cell)
        }
    } return board;
}

function countMines(board, pos, cell) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === pos.i && j === pos.j) continue;
            var negPos = { i: i, j: j };
            if (!cell.isMine && board[negPos.i][negPos.j].isMine) {
                cell.minesAroundCount += 1;
            }
        }
    }
}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (event.which == 3) {
        if (!cell.isMarked && !cell.isShown) {
            cell.isMarked = true;
        } else {
            cell.isMarked = false;
        }
    }
    else if (!cell.isMarked) {
        cell.isShown = true;
    }
    if (cell.isMine === true) {
        livesCount--;
        updateLives();
    }
    if (!gGame.isOn) {
        gGame.isOn = true;
        stopWatch();
    }
    renderBoard(gBoard)
}

function updateLives() {
    var elLives = document.querySelector('.container')
    elLives.innerHTML = '';
    for (var i = 0; i < livesCount; i++) {
        elLives.innerHTML += livesDisplay
    }
}
// function cellMarked(cell) {
//     if (!cell.isMarked) {
//         cell.isMarked = !cell.isMarked
//         renderCell(cell, '')
//     } else {
//         cell.isMarked = true;
//         renderCell(cell, FLAG)
//     }
// }

// function renderCell(location, value) {
//     var cellSelector = '.' + getClassName(location);
//     var elCell = document.querySelector(cellSelector);
//     elCell.innerHTML = value;
// }

function getRandomMines(board, numOfMines) {
    for (var i = 0; i < numOfMines; i++) {
        var minePos = getRandPos(board);
        board[minePos.i][minePos.j].isMine = true;
    }
}

function getRandPos(board) {
    var emptyPoses = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var pos = { i: i, j: j };
            emptyPoses.push(pos);
        }
    }
    var randPos = emptyPoses[Math.round(getRandomIntInclusive(0, emptyPoses.length - 1))];
    return randPos;
}

function renderTime(time) {
    var elTimer = document.querySelector('.timer');
    gTimeElapsed = new Date(time).toISOString().slice(15, -1);
    elTimer.innerText = 'Time: ' + gTimeElapsed;
}

function stopWatch() {
    var milSecElapsed = 0;
    gStopWatchInterval = setInterval(function () {
        milSecElapsed += 5;
        renderTime(milSecElapsed);
    }, 5);
    clearInterval(gStopWatchInterval);
}




function checkGameOver() {

}

function expandShown(board, cell, i, j) {

}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}