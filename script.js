"use strict";

class Settings {
    constructor() {
        this.menu = document.getElementById('menuContent');
        this.guesses = document.getElementById('menu-guesses');
        this.startRange = document.getElementById('menu-startRange');
        this.endRange = document.getElementById('menu-endRange');

        this.inputList = [this.guesses, this.startRange, this.endRange];
    }
}

class Progress {
    constructor() {
        this.table = document.getElementById('progress');
        this.guesses = document.getElementById('guesses');
        this.lastResult = document.getElementById('lastResult');
        this.lowOrHi = document.getElementById('lowOrHi');
    }
}

class Result {
    constructor(guesses, lastResult, lowOrHi, answer) {
        this.guesses = guesses;
        this.lastResult = lastResult;
        this.lowOrHi = lowOrHi;
        this.answer = answer;
    }

    static toElement (elementType, value, optns) {
        let tempElement = document.createElement(elementType);
        tempElement.innerHTML = value;

        if (optns) {
            if (optns['class'])
                for (let i = 0; i < optns['class'].length; i++) {
                    let className = optns['class'][i];
                    tempElement.classList.add(className);
                }
        }

        return tempElement;
    }
}

let content = document.getElementById('content');
let guessField = document.getElementById('guessField');
let submitButton = document.getElementById('submit-button');
let submitButtonDisplay = submitButton.style.display;
let resultsTable = document.getElementById('results');
let resultsTableDisplay = resultsTable.style.display;
let menuButton = document.getElementById('menuButton');
let menuExitButton = document.getElementById('menuExit');
let menuOp = document.getElementById('menuOp');
let saveChangesButton = document.getElementById('saveChanges');
let discardChangesButton = document.getElementById('discardChanges');
let progress = new Progress();
let settings = new Settings();

let results = [];
let currentResult = null;

let numGuesses = 10;
let startRange = 1;
let endRange = 100;

let randomNumber = () => parseInt(Math.random() * (endRange+1 - startRange) + startRange);
let answer;
let turns;
let gameOver;

let settingsChanged = false;

submitButton.addEventListener('click', () => {
    clearResponse();
    newGuess();
});

guessField.addEventListener('input', clearResponse);
guessField.addEventListener('keyup', (ev) => {
    if (ev.key === "Enter") {
        submitButton.click();
    }
});

menuButton.addEventListener('click', () => {
    loadSettings();
    menuOp.classList.add("show-95");
});

let hideMenu = () => {
    menuOp.classList.remove('show-95');
}

for (let i = 0; i < settings.inputList.length; i++) {
    let inputSetting = settings.inputList[i];
    inputSetting.addEventListener('input', () => {
        settingsChanged = true;
    });
}

menuExitButton.addEventListener('click', hideMenu);

saveChangesButton.addEventListener('click', () => {
    let startNewGame = false;
    if (settingsChanged) {
        let newGuess = parseInt(settings.guesses.value);
        let newStartRange = parseInt(settings.startRange.value);
        let newEndRange = parseInt(settings.endRange.value);
        let getLabel = (e) => e.labels[0].innerHTML.replace(":", "");

        let checkNum = (val, el) => {
            if (isNaN(val)) {
                window.alert(`${getLabel(el)} must be a number.`);
                return false;
            }

            return true;
        };

        if (!checkNum(newGuess, settings.guesses) ||
            !checkNum(newStartRange, settings.startRange) ||
            !checkNum(newEndRange, settings.endRange)) return;

        if (newGuess === 0) {
            window.alert('Number of guesses can not be 0.');
            return;
        }

        if (newStartRange > newEndRange) {
            window.alert('Start range can not be greater than end range.');
            return;
        }

        if (newStartRange < 0 || newEndRange < 0) {
            window.alert('Range must be positive');
            return;
        }

        if (settingsChanged && !confirm("Changing settings will reset the game, are you sure you want to continue?")) {
            return;
        }

        numGuesses = newGuess;
        startRange = newStartRange;
        endRange = newEndRange;

        window.alert('Settings successfully saved.');
        startNewGame = true;
    }

    settingsChanged = false;
    hideMenu();

    if (startNewGame) newGame();
});

discardChangesButton.addEventListener('click', () => {
    if(settingsChanged && !confirm("You have unsaved modifications to settings, are you sure you want to discard changes?")) {
        return;
    }
    settingsChanged = false;
    hideMenu();
});

newGame();

function newGame() {
    answer = randomNumber();
    turns = numGuesses;

    progress.guesses.innerHTML = numGuesses;
    progress.lastResult.innerHTML = "";
    progress.lowOrHi.innerHTML = "";

    currentResult = null;

    gameOver = false;

    if (results.length === 0) resultsTable.style.display = 'none';

    clearResults();
    clearResponse();

    guessField.disabled = false;
    guessField.focus();
}

function newGuess () {
    if (gameOver) return;

    let value = parseInt(guessField.value);
    guessField.value = '';

    if (isNaN(value) || (!value && value !== 0)) {
        addResponse('Please enter a valid number.', true);
        return;
    }

    if (value < startRange || value > endRange) {
        addResponse(`Please enter a number between ${startRange} and ${endRange}.`, true);
        return;
    }

    if (value === answer) {
        addResponse('You got it correct!', false);
        setGameOver();
    } else {
        let tempGameOver = --turns === 0;
        let message = !tempGameOver ? `Incorrect, you have ${turns} guesses left.` : `Sorry better luck next time! The number was ${answer}`;

        progress.guesses.innerHTML = turns;
        progress.lastResult.innerHTML = value;
        progress.lowOrHi.innerHTML = value > answer ? "High" : "Low";

        addResponse(message, true);

        if (tempGameOver) setGameOver();
    }
}

function setGameOver () {
    gameOver = true;
    guessField.disabled = true;

    displayResults();
}

function displayResults () {
    let newGameButton = document.createElement('button');
    newGameButton.innerHTML = 'New game';
    newGameButton.addEventListener('click', (ev) => {
        newGame();
        ev.target.remove();
        submitButton.style.display = submitButtonDisplay;
    });

    submitButton.after(newGameButton);
    submitButton.style.display = 'none';

    let result = new Result(results.length + 1,
        progress.lastResult.innerHTML,
        progress.lowOrHi.innerHTML,
        answer);

    let resultElement = document.createElement('tr');

    results.push(result);

    let optns = {
        'class': ['result-list']
    };

    resultElement.append(Result.toElement('td', results.length, optns));
    resultElement.append(Result.toElement('td', result.guesses, optns));
    resultElement.append(Result.toElement('td', result.lastResult, optns));
    resultElement.append(Result.toElement('td', result.lowOrHi, optns));
    resultElement.append(Result.toElement('td', result.answer, optns));

    resultsTable.append(resultElement);

    if (results.length > 0) {
        resultsTable.style.display = resultsTableDisplay;
    }
}

function clearResults () {
    let resultList = document.getElementsByClassName('result-list');

    for (let i = 0; i < resultList.length; i++) {
        resultList[i].remove();
    }
}

function addResponse (message, isError) {
    let response = document.createElement('div');

    response.style.backgroundColor = isError ? 'red' : 'green';
    response.style.color = 'white';
    response.style.margin = '32px 0 0 0';
    response.innerHTML = message;
    response.classList.add('response-message');

    content.append(response);
}

function clearResponse () {
    let responses = document.getElementsByClassName('response-message');

    for (let r = 0; r < responses.length; r++) {
        let element = responses[r];
        element.remove();
    }
}

function loadSettings () {
    settings.guesses.value = numGuesses;
    settings.startRange.value = startRange;
    settings.endRange.value = endRange;
}