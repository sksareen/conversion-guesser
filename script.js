// Conversion types and their corresponding units
const conversionTypes = [
    {
        type: 'length',
        units: [
            { name: 'inches', toBase: 2.54, fromBase: 1/2.54 },
            { name: 'feet', toBase: 30.48, fromBase: 1/30.48 },
            { name: 'yards', toBase: 91.44, fromBase: 1/91.44 },
            { name: 'miles', toBase: 1609.34, fromBase: 1/1609.34 },
            { name: 'centimeters', toBase: 1, fromBase: 1 },
            { name: 'meters', toBase: 100, fromBase: 1/100 },
            { name: 'kilometers', toBase: 100000, fromBase: 1/100000 }
        ],
        baseUnit: 'centimeters'
    },
    {
        type: 'weight',
        units: [
            { name: 'ounces', toBase: 28.35, fromBase: 1/28.35 },
            { name: 'pounds', toBase: 453.59, fromBase: 1/453.59 },
            { name: 'grams', toBase: 1, fromBase: 1 },
            { name: 'kilograms', toBase: 1000, fromBase: 1/1000 }
        ],
        baseUnit: 'grams'
    },
    {
        type: 'volume',
        units: [
            { name: 'fluid ounces', toBase: 29.57, fromBase: 1/29.57 },
            { name: 'cups', toBase: 236.59, fromBase: 1/236.59 },
            { name: 'pints', toBase: 473.18, fromBase: 1/473.18 },
            { name: 'quarts', toBase: 946.35, fromBase: 1/946.35 },
            { name: 'gallons', toBase: 3785.41, fromBase: 1/3785.41 },
            { name: 'milliliters', toBase: 1, fromBase: 1 },
            { name: 'liters', toBase: 1000, fromBase: 1/1000 }
        ],
        baseUnit: 'milliliters'
    },
    {
        type: 'temperature',
        units: [
            { 
                name: 'Fahrenheit', 
                toBase: (f) => (f - 32) * 5/9 + 273.15, 
                fromBase: (k) => (k - 273.15) * 9/5 + 32 
            },
            { 
                name: 'Celsius', 
                toBase: (c) => c + 273.15, 
                fromBase: (k) => k - 273.15 
            },
            { 
                name: 'Kelvin', 
                toBase: (k) => k, 
                fromBase: (k) => k 
            }
        ],
        baseUnit: 'Kelvin'
    }
];

// Game state
let currentQuestion = {};
let score = 0;

// DOM Elements
const questionElement = document.getElementById('question');
const userAnswerInput = document.getElementById('user-answer');
const submitButton = document.getElementById('submit-btn');
const resultContainer = document.getElementById('result-container');
const resultMessage = document.getElementById('result-message');
const correctAnswerElement = document.getElementById('correct-answer');
const nextButton = document.getElementById('next-btn');
const scoreElement = document.getElementById('score');

// Generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random conversion question
function generateQuestion() {
    // Select a random conversion type
    const conversionType = conversionTypes[getRandomNumber(0, conversionTypes.length - 1)];
    
    // Select two different random units from this type
    const unitIndices = [];
    while (unitIndices.length < 2) {
        const idx = getRandomNumber(0, conversionType.units.length - 1);
        if (!unitIndices.includes(idx)) {
            unitIndices.push(idx);
        }
    }
    
    const fromUnit = conversionType.units[unitIndices[0]];
    const toUnit = conversionType.units[unitIndices[1]];
    
    // Generate a random value for the from unit
    let fromValue;
    
    if (conversionType.type === 'temperature') {
        // For temperature, use realistic ranges
        if (fromUnit.name === 'Fahrenheit') {
            fromValue = getRandomNumber(32, 100);
        } else if (fromUnit.name === 'Celsius') {
            fromValue = getRandomNumber(0, 40);
        } else { // Kelvin
            fromValue = getRandomNumber(273, 313);
        }
    } else {
        // For other units, keep values between 1-100 for simplicity
        fromValue = getRandomNumber(1, 100);
    }
    
    // Calculate the correct answer
    let correctAnswer;
    
    if (conversionType.type === 'temperature') {
        // For temperature, we need to use the conversion functions
        const baseValue = fromUnit.toBase(fromValue);
        correctAnswer = toUnit.fromBase(baseValue);
    } else {
        // For other units, we convert to base unit then to target unit
        const baseValue = fromValue * fromUnit.toBase;
        correctAnswer = baseValue * toUnit.fromBase;
    }
    
    // Round to 2 decimal places
    correctAnswer = Math.round(correctAnswer * 100) / 100;
    
    return {
        fromValue,
        fromUnit: fromUnit.name,
        toUnit: toUnit.name,
        correctAnswer,
        conversionType: conversionType.type
    };
}

// Check the user's answer
function checkAnswer() {
    const userAnswer = parseFloat(userAnswerInput.value);
    
    if (isNaN(userAnswer)) {
        alert('Please enter a valid number');
        return;
    }
    
    const isCorrect = Math.abs(userAnswer - currentQuestion.correctAnswer) < 0.1; // Allow small rounding errors
    
    resultContainer.classList.remove('hidden');
    if (isCorrect) {
        resultMessage.textContent = 'Correct! Great job!';
        resultContainer.classList.remove('incorrect');
        resultContainer.style.borderLeftColor = '#4CAF50';
        score++;
        scoreElement.textContent = score;
    } else {
        resultMessage.textContent = 'Incorrect. Try again next time!';
        resultContainer.classList.add('incorrect');
        resultContainer.style.borderLeftColor = '#f44336';
    }
    
    correctAnswerElement.textContent = `The correct answer is ${currentQuestion.correctAnswer} ${currentQuestion.toUnit}.`;
    
    // Disable the submit button and answer input
    submitButton.disabled = true;
    userAnswerInput.disabled = true;
}

// Set up a new question
function setupNewQuestion() {
    currentQuestion = generateQuestion();
    questionElement.textContent = `Convert ${currentQuestion.fromValue} ${currentQuestion.fromUnit} to ${currentQuestion.toUnit}.`;
    
    // Reset UI
    userAnswerInput.value = '';
    userAnswerInput.disabled = false;
    submitButton.disabled = false;
    resultContainer.classList.add('hidden');
}

// Event listeners
submitButton.addEventListener('click', checkAnswer);

nextButton.addEventListener('click', setupNewQuestion);

// Allow pressing Enter to submit answer
userAnswerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (!submitButton.disabled) {
            checkAnswer();
        }
    }
});

// Initialize the game
setupNewQuestion();
