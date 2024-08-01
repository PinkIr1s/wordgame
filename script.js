let initialWord;
let target;
let lastGuess = null;
let hashTable = hashDictionary(validWords);
// instantiateTarget(target);
let shownCharLimit = false;
let guesses = 0;



const { Random, MersenneTwister19937 } = window.Random;
const engine = MersenneTwister19937.seed(Math.floor(Date.now() / (86400000))); // Seed: Days since Jan 1st 1970.
const random = new Random(engine);



const inputElement = document.querySelector("#input > input");

function start() {
    inputElement.focus();

    const wordPath = getNewPuzzle(5, true); // new puzzle of depth (steps) 4.
    initialWord = wordPath[0];
    target = wordPath[wordPath.length - 1];

    givenGuess(initialWord);
    lastGuess = initialWord;
    instantiateTarget(target);
}

function reroll() {
    const wordPath = getNewPuzzle(5, false);
    initialWord = wordPath[0];
    target = wordPath[wordPath.length - 1];

    const mainElement = document.getElementById("main");
    // mainElement.removeChild(mainElement.firstElementChild);

    // const mainElement = document.getElementById("main");
    const guessElements = mainElement.children;
    let iterations = guessElements.length;
    for (let i = 0; i < iterations; i++) {
        if (guessElements[i].classList.contains("guess")) {
            mainElement.removeChild(guessElements[i]);
            i--;
            iterations--;
        }
    }

    guesses = 0;

    givenGuess(initialWord);
    lastGuess = initialWord;
    instantiateTarget(target);
}

function givenGuess(str) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("guess");
    wrapper.classList.add("given");
    for (let i = 0; i < str.length; i++) {
        let letter = `<span class="tile">${str[i]}</span>`;
        wrapper.innerHTML += letter;
    }
    const mainElement = document.getElementById("main");
    mainElement.insertBefore(wrapper, document.getElementById("input"));
}

function instantiateTarget(word) {
    const targetElement = document.getElementById("target");
    html = "";
    for (let i = 0; i < word.length; i++) {
        html += `<span class="tile">${word[i]}</span>`;
    }
    targetElement.innerHTML = html;
}

function checkSimilarityOf(strA, strB, m, n)
{
    if (m == 0)
        return n;

    if (n == 0)
        return m;

    if (strA[m - 1] == strB[n - 1])
        return checkSimilarityOf(strA, strB, m - 1, n - 1);

    return 1 + 
    min(checkSimilarityOf(strA, strB, m, n - 1), // Insert
        checkSimilarityOf(strA, strB, m - 1, n), // Remove
        checkSimilarityOf(strA, strB, m - 1, n - 1)); // Replace
}

function min(x, y, z)
{
   return Math.min(x, Math.min(y, z));
}

function checkGuess(guess) {
    if (!checkDictionary(guess)) {
        return;
    }
    // const guess = inputElement.value.toUpperCase();
    if (checkSimilarityOf(guess, lastGuess, guess.length, lastGuess.length) === 1) {
        addGuess(guess);
        lastGuess = guess;
        if (guess === target) {    
            showPopup("YAY YOU WON IN " + guesses);
        } else if (guesses >= 6) {
            showPopup("NOO YOU DIED :(((")
        }
    }
}
    
function addGuess(str) {
    guesses++;
    const wrapper = document.createElement("div");
    wrapper.classList.add("guess");
    for (let i = 0; i < str.length; i++) {
        let letter = `<span class="tile">${str[i]}</span>`;
        wrapper.innerHTML += letter;
    }
    const mainElement = document.getElementById("main");
    mainElement.insertBefore(wrapper, document.getElementById("input"));
}

inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        checkGuess(inputElement.value.toUpperCase());
        inputElement.value = "";
    } else if (inputElement.value.length >= 9 && event.key !== "Backspace" && event.key !== "Delete") {
        if (!shownCharLimit) {
            showPopup("Guesses are limited to 9 characters.");
            shownCharLimit = true;
        }
        event.preventDefault();
    } else if (!/[a-zA-Z]/.test(event.key)) {
        event.preventDefault();
    }
});

function showPopup(message) {
    alert(message);
}

function hashDictionary(dict) {
    let hash = [];
    for (let i = 0; i < dict.length; i++) {
        if (hash[dict[i].toUpperCase().charAt(0)] === undefined) {
            hash[dict[i].toUpperCase().charAt(0)] = [];
        }
        hash[dict[i].toUpperCase().charAt(0)].push(dict[i].toUpperCase());
    }
    return hash;
}

function checkDictionary(str) {
    for (let i = 0; i < hashTable[str.toUpperCase().charAt(0)].length; i++) {
        if (hashTable[str.toUpperCase().charAt(0)][i] === str) {
            return true;
        }
    }
    return false;
}

document.addEventListener("click", (event) => {
    inputElement.focus();
});

function getNewPuzzle(depth, isDaily) {
    const startingIndex = isDaily ? random.integer(0, validWords.length) : Math.floor(Math.random() * validWords.length);
    const starterWord = validWords[startingIndex].toUpperCase();
    let currentWord = starterWord;
    let usedIndices = [startingIndex];
    let wordPath = [starterWord];
    
    for (let i = 0; i < depth; i++) {
        let possibleVariants = [];
        
        for (let j = 0; j < validWords.length; j++) {
            let word = validWords[j].toUpperCase();
            if (checkSimilarityOf(currentWord, word, currentWord.length, word.length) === 1 &&
                !usedIndices.includes(j)) {
                possibleVariants.push(j); // Store index of valid variant
            }
        }

        // Debugging output
        // console.log(`Iteration ${i}: currentWord = ${currentWord}, possibleVariants = ${possibleVariants.map(idx => validWords[idx])}`);
        
        if (possibleVariants.length > 0) {
            let newIndex = isDaily ? possibleVariants[random.integer(0, possibleVariants.length)] : possibleVariants[Math.floor(Math.random() * possibleVariants.length)];
            usedIndices.push(newIndex);
            currentWord = validWords[newIndex].toUpperCase(); // Update to uppercase
            wordPath.push(currentWord);
        } else {
            // No valid variants found, break the loop
            // console.log(`No more valid variants found at iteration ${i}`);
            break;
        }
    }
    
    // Debugging output
    // console.log(`Final wordPath: ${wordPath}`);
    
    return wordPath;
}

