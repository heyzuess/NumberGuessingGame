"use strict";

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
let result = document.getElementById('resultParas');
let submitButton = document.getElementById('submit-button');
let submitButtonDisplay = submitButton.style.display;
let resultsTable = document.getElementById('results');
let resultsTableDisplay = resultsTable.style.display;
let progress = new Progress();

let results = [];
let currentResult = null;

let randomNumber = () => parseInt(Math.random() * (101 - 1) + 1);
let answer;
let turns;
let gameOver;

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

newGame();

function newGame() {
    answer = randomNumber();
    turns = 10;

    progress.guesses.innerHTML = turns;
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

    if (value < 1 || value > 100) {
        addResponse('Please enter a number between 1 and 100.', true);
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