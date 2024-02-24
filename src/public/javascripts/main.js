function createElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) {element.className = className;}
    if (content) {element.textContent = content;}
    return element;
}

// Function to create a deck of cards
function createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];

    suits.forEach(suit => {
        faces.forEach(face => {
            deck.push({ face, suit });
        });
    });

    return deck;
}

// Function to shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Function to add top cards based on user input
function addTopCards(deck, inputValues) {
    const topCards = inputValues.split(',').map(face => ({ face, suit: 'Diamonds' }));
    deck.unshift(...topCards);
}

// Function to deal cards
function dealCards(deck) {
    const computerHand = [];
    const playerHand = [];

    for (let i = 0; i < 4; i++) {
        const card = deck.shift();
        if (i % 2 === 0) {
            computerHand.push(card);
        } else {
            playerHand.push(card);
        }
    }

    return { computerHand, playerHand };
}

// Function to calculate the hand total
function calculateHandTotal(hand) {
    let total = 0;
    let aces = 0;

    hand.forEach(card => {
        if (card.face === 'A') {
            aces++;
            total += 11;
        } else if (['J', 'Q', 'K'].includes(card.face)) {
            total += 10;
        } else {
            total += parseInt(card.face, 10);
        }
    });

    // Adjust aces value if total is over 21
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}



function displayCard(card, container, hidden = false) {
    const cardElement = createElement('div', 'card', hidden ? '? of ?' : `${card.face} of ${card.suit}`);
    if (hidden) {
        cardElement.setAttribute('data-hidden', 'true'); // Mark the card as hidden
        cardElement.setAttribute('data-face', card.face); // Store the face value for later
        cardElement.setAttribute('data-suit', card.suit); // Store the suit value for later
    }
    container.appendChild(cardElement);
}


// Function to display hands
function displayHands(computerHand, playerHand) {
    const gameArea = document.querySelector('.game');
    gameArea.innerHTML = '';

    const computerContainer = createElement('div', 'hand computer');
    const playerContainer = createElement('div', 'hand player');

    // Display computer's cards (hide the first card)
    computerHand.forEach((card, index) => {
        if (index === 0) {
            //displayCard({ face: '?', suit: '?' }, computerContainer);
            displayCard(card, computerContainer, index === 0);
        } else {
            displayCard(card, computerContainer);
        }
    });

    // Display player's cards
    playerHand.forEach(card => displayCard(card, playerContainer));

    gameArea.appendChild(computerContainer);
    gameArea.appendChild(playerContainer);
}

// Function to display totals
function displayTotals(computerHand, playerHand) {
    const gameArea = document.querySelector('.game');

    // Calculate totals using the hand arrays, not DOM elements
    const computerTotal = calculateHandTotal(computerHand); // This should be an array of card objects
    const playerTotal = calculateHandTotal(playerHand); // This should be an array of card objects

    // Create elements for displaying the totals
    const computerTotalElement = createElement('div', 'total computer', `Computer Total: ?`);
    const playerTotalElement = createElement('div', 'total player', `Your Total: ${playerTotal}`);

    // Append the total elements to the game area
    gameArea.appendChild(computerTotalElement);
    gameArea.appendChild(playerTotalElement);

    // Return the total elements for later use
    return { computerTotalElement, playerTotalElement };
}


function addGameControls(deck, playerHand, computerHand) {
    const gameArea = document.querySelector('.game');
    // Clear previous controls to ensure they are not duplicated
    const existingControls = gameArea.querySelector('.controls');
    if (existingControls) {
        existingControls.remove();
    }

    const controlsArea = createElement('div', 'controls', '');
    const hitButton = createElement('button', 'btn hit', 'Hit');
    const standButton = createElement('button', 'btn stand', 'Stand');

    // We need to update playerTotalElement and computerTotalElement references here
    const playerTotalElement = document.querySelector('.total.player');
    const computerTotalElement = document.querySelector('.total.computer');

    hitButton.addEventListener('click', () => hitHandler(deck, playerHand, playerTotalElement, computerHand));
    standButton.addEventListener('click', () => standHandler(deck, computerHand, computerTotalElement, playerHand));
    controlsArea.appendChild(hitButton);
    controlsArea.appendChild(standButton);

    gameArea.appendChild(controlsArea);
}

// Start the game with the user's input values
function startGameWithInputValues(inputValues) {
    const deck = createDeck();
    shuffleDeck(deck);

    if (inputValues) {
        addTopCards(deck, inputValues);
    }

    const { computerHand, playerHand } = dealCards(deck);
    displayHands(computerHand, playerHand);
    displayTotals(computerHand, playerHand); // This will create the total elements
    addGameControls(deck, playerHand, computerHand); // Pass the deck and hands, not the total elements
}


function hitHandler(deck, playerHand, playerTotalElement, computerHand) {
    console.log('Hit button clicked'); // Debug line to confirm the hitHandler is being called

    const card = deck.shift();
    playerHand.push(card);
    displayCard(card, document.querySelector('.hand.player'));

    const playerTotal = calculateHandTotal(playerHand);
    console.log('Player hand after hit:', playerHand); // Debug the player's hand
    console.log('Player total after hit:', playerTotal); // Debug the player's total
    playerTotalElement.textContent = `Your Total: ${playerTotal}`;

    if (playerTotal > 21) {
        console.log('Player total is above 21, should end game.'); // Confirm if this executes
        document.querySelector('.btn.hit').disabled = true; // Disable the hit button
        document.querySelector('.btn.stand').disabled = true; // Disable the stand button

        endGame('User busts! Computer wins.', computerHand);
    } else {
        console.log('Player total is not above 21, game continues.'); // Confirm if this executes
    }
}


function standHandler(deck, computerHand, computerTotalElement, playerHand) {
    let computerTotal = calculateHandTotal(computerHand);
    const playerTotal = calculateHandTotal(playerHand);

    // Computer strategy: hit if total < 17
    while (computerTotal < 17) {
        const card = deck.shift();
        computerHand.push(card);
        displayCard(card, document.querySelector('.hand.computer'));
        computerTotal = calculateHandTotal(computerHand);
    }

    computerTotalElement.textContent = `Computer Total: ${computerTotal}`;

    // Determine winner or if it's a tie
    if (playerTotal > 21) {
        endGame('User busts! Computer wins.', computerHand);
    } else if (computerTotal > 21) {
        endGame('Computer busts! User wins.', computerHand);
    } else if (playerTotal === computerTotal) {
        endGame('It\'s a tie!', computerHand);
    } else {
        endGame(playerTotal > computerTotal ? 'User wins!' : 'Computer wins!', computerHand);
    }
}

function endGame(message, computerHand) {
    console.log('endGame called with message:', message);
    alert(message);

    // Reveal computer's total and the first hidden card
    const computerTotal = calculateHandTotal(computerHand);
    const computerTotalElement = document.querySelector('.total.computer');
    const hiddenCardElement = document.querySelector('.card[data-hidden="true"]');

    if (hiddenCardElement) {
        // Update the text content to reveal the card
        const face = hiddenCardElement.getAttribute('data-face');
        const suit = hiddenCardElement.getAttribute('data-suit');
        hiddenCardElement.textContent = `${face} of ${suit}`;
        hiddenCardElement.removeAttribute('data-hidden'); // Remove the hidden attribute
    }

    computerTotalElement.textContent = `Computer Total: ${computerTotal}`;

    // Disable Hit and Stand buttons
    document.querySelectorAll('.controls .btn').forEach(button => button.disabled = true);
}


// Main function to set up the game
function main() {
    const form = document.querySelector('.start form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        this.classList.add('hidden');
        const inputValues = document.getElementById('startValues').value;
        startGameWithInputValues(inputValues);
    });
}

// Ensure everything runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', main);





