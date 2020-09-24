'use strict';
const MINE = '<img class="flag" src="img/mine.png">'
const FLAG = '<img class="flag" src="img/flag.png">';
const EMPTY = ''
const HAPPY_FACE = '<img class="flag" src="img/happy.png">';
const SAD_FACE = '<img class="flag" src="img/sad.png">';
const WINNER = '<img class="flag" src="img/victory.png">';
const livesDisplay = '<img class="heart" src="img/life-1.png">';
var gStopWatchInterval;
var gTimeElapsed;
var gLivesCount;
var gIsGameOver;
var gIsFirstClick;
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 3
};
var gGame;

function init(level) {
    gIsFirstClick = true;
    gLevel = level
    clearInterval(gStopWatchInterval);
    gTimeElapsed = '00:00:00';
    gLivesCount = 3;
    gIsGameOver = false;
    gGame = {
        isOn: false,
        shownCount: 0, markedCount: 0, secsPassed: 0
    }
    var elEmoji = document.querySelector('.emoji')
    elEmoji.innerHTML = HAPPY_FACE
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
    updateLives();
    renderTime(0);
}

function chooseLevel(level) {
    if (level === 'easy') {
        level = {
            SIZE: 4,
            MINES: 3
        };
    }
    if (level === 'medium') {
        level = {
            SIZE: 8,
            MINES: 12
        };
    }
    if (level === 'hard') {
        level = {
            SIZE: 12,
            MINES: 30
        };
    }
    init(level);
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
    return board;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j });
            if (currCell.isShown === true) cellClass += ' shown';
            strHTML += '\t<td class="' + cellClass + '"  onclick="cellClicked(this, ' + i + ', ' + j + ')" oncontextmenu="cellMarked(this, ' + i + ', ' + j + ')" >\n';
            if (currCell.isMine === true && currCell.isShown) {
                strHTML += MINE;
            } else if (currCell.isShown && currCell.minesAroundCount !== 0) {
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

function cellMarked(cell, i, j) {
    if (checkGameOver(gIsGameOver)) {
        return;
    }
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);
    var cell = gBoard[i][j]
    if (event.which == 3) {
        if (!cell.isMarked && !cell.isShown) {
            cell.isMarked = true;
            gGame.markedCount++
        } else {
            gGame.markedCount--;
            cell.isMarked = false;
        }
    }
    checkIsVictory();
    renderBoard(gBoard)
}

function cellClicked(elCell, i, j) {
    if (checkGameOver(gIsGameOver)) {
        return;
    }
    var clickedPos = { i: i, j: j };
    var cell = gBoard[i][j];
    if (gIsFirstClick) {
        clickedPos.minesAroundCount === 0
        getRandomMines(gBoard, gLevel.MINES, cell);
        setMinesNegsCount(gBoard);
        gGame.isOn = true;
        stopWatch();
        gIsFirstClick = false;
    }
    if (cell.isShown) return;
    else if (!cell.isMarked && !cell.isShown && !cell.isMine) {
        cell.isShown = true;
        gGame.shownCount++
        expandShown(gBoard, clickedPos, i, j);
        updateEmoji(HAPPY_FACE)
    }
    if (cell.isMine === true && !cell.isMarked) {
        cell.isShown = true;
        gLivesCount--;
        if (gLivesCount !== 0) {
            setTimeout(function () { cell.isShown = false; updateEmoji(HAPPY_FACE), renderBoard(gBoard) }, 800);
        }
        updateEmoji(SAD_FACE)
        updateLives();
        checkGameOver(gIsGameOver)
    }
    checkIsVictory();
    renderBoard(gBoard);
}

function getRandomMines(board, numOfMines, firstCell) {
    for (var i = 0; i < numOfMines; i++) {
        var minePos = getRandPos(board);
        var currPos = board[minePos.i][minePos.j];
        if (currPos !== firstCell) {
            board[minePos.i][minePos.j].isMine = true;
        }
    }
}

function expandShown(board, pos, i, j) {
    var clickedCell = board[i][j]
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var cell = board[i][j];
            if (cell.isMine || cell.isMarked || cell.isShown || clickedCell.isMine) continue;
            else if (clickedCell.minesAroundCount === 0) {
                cell.isShown = true;
                gGame.shownCount++;
            }
        }
    }
    renderBoard(board)
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
            minesCounter(board, cellPos, cell)
        }
    } return board;
}

function minesCounter(board, pos, cell) {
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

function updateEmoji(emoji) {
    var elEmoji = document.querySelector('.emoji')
    elEmoji.innerHTML = emoji;
}

function updateLives() {
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = '';
    for (var i = 0; i < gLivesCount; i++) {
        elLives.innerHTML += livesDisplay;
    }
}

function checkGameOver(gIsGameOver) {
    if (gLivesCount === 0) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                var cell = gBoard[i][j];
                if (cell.isMine) {
                    cell.isShown = true;
                }
            }
            var elRetryBtn = document.querySelector('.lives')
            elRetryBtn.innerHTML = '<button class="restart" onclick="init(gLevel)"><div id="slide">RETRY</div></button>';
            clearInterval(gStopWatchInterval);
        }
        updateEmoji(SAD_FACE)
        return true;
    } return false
}

function checkIsVictory() {
    var numOfCells = gLevel.SIZE ** 2
    if ((gGame.markedCount + gGame.shownCount === numOfCells) || gGame.markedCount === gLevel.MINES) {
        updateEmoji(WINNER)
        clearInterval(gStopWatchInterval);
        var elVicBtn = document.querySelector('.lives')
        elVicBtn.innerHTML = '<button class="restart " onclick="init(gLevel)">VICTORY!</button>';
        return true;
    }
    return false;
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
    gGame.secsPassed = gTimeElapsed;
}

function stopWatch() {
    var milSecElapsed = 0;
    gStopWatchInterval = setInterval(function () {
        milSecElapsed += 50;
        renderTime(milSecElapsed);
    }, 50);

}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}