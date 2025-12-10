// ==================== PASSCODE LOGIC ====================
const CORRECT_PASSCODE = '2401';

function initPasscode() {
    const passcodeScreen = document.getElementById('passcode-screen');
    const mainApp = document.getElementById('main-app');
    const passcodeInputs = document.querySelectorAll('.passcode-digit');
    const passcodeError = document.getElementById('passcode-error');
    const submitBtn = document.getElementById('passcode-submit');

    // Check if already authenticated this session
    if (sessionStorage.getItem('authenticated') === 'true') {
        passcodeScreen.classList.add('hidden');
        mainApp.classList.add('visible');
        return;
    }

    // Auto-focus first input
    passcodeInputs[0].focus();

    // Handle input on each digit
    passcodeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Only allow digits
            input.value = input.value.replace(/[^0-9]/g, '');
            
            // Add filled class if has value
            if (input.value) {
                input.classList.add('filled');
                // Auto-advance to next input
                if (index < passcodeInputs.length - 1) {
                    passcodeInputs[index + 1].focus();
                }
            } else {
                input.classList.remove('filled');
            }
            
            // Clear error when typing
            passcodeError.textContent = '';
        });

        // Handle backspace to go to previous input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                passcodeInputs[index - 1].focus();
            }
            // Submit on Enter if all filled
            if (e.key === 'Enter') {
                checkPasscode();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
            pastedData.split('').forEach((char, i) => {
                if (passcodeInputs[i]) {
                    passcodeInputs[i].value = char;
                    passcodeInputs[i].classList.add('filled');
                }
            });
            if (pastedData.length > 0) {
                passcodeInputs[Math.min(pastedData.length, 3)].focus();
            }
        });
    });

    // Submit button handler
    submitBtn.addEventListener('click', checkPasscode);

    function checkPasscode() {
        const enteredCode = Array.from(passcodeInputs).map(i => i.value).join('');
        
        if (enteredCode.length < 4) {
            passcodeError.textContent = 'Please enter all 4 digits';
            return;
        }

        if (enteredCode === CORRECT_PASSCODE) {
            // Success - hide passcode screen, show app
            sessionStorage.setItem('authenticated', 'true');
            passcodeScreen.classList.add('hidden');
            mainApp.classList.add('visible');
        } else {
            // Wrong passcode - show error and shake
            passcodeError.textContent = 'Incorrect passcode';
            const inputsContainer = document.querySelector('.passcode-inputs');
            inputsContainer.classList.add('shake');
            
            // Remove shake class after animation
            setTimeout(() => {
                inputsContainer.classList.remove('shake');
            }, 500);

            // Clear inputs
            passcodeInputs.forEach(input => {
                input.value = '';
                input.classList.remove('filled');
            });
            passcodeInputs[0].focus();
        }
    }
}

// ==================== MAIN APP LOGIC ====================

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
    // Initialize passcode screen
    initPasscode();

    // Initialize sudoku grid inputs
    const inputs = document.querySelectorAll('.box input');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Remove anything that isn't 1-9
            input.value = input.value.replace(/[^1-9]/g, '');
        });
    });
});

// Read the grid values into a JS array
function readBoard() {
    const inputs = document.querySelectorAll('.box input');
    const board = [];
    inputs.forEach(input => {
        const val = parseInt(input.value);
        board.push(isNaN(val) ? 0 : val);
    });
    return board;
}

// Write JS array values back to the grid with staggered animation
function writeBoard(board) {
    const inputs = document.querySelectorAll('.box input');
    const emptyCells = [];
    
    // First pass: identify which cells need to be filled
    inputs.forEach((input, idx) => {
        if (!input.value && board[idx] !== 0) {
            emptyCells.push({ input, value: board[idx], idx });
        }
    });
    
    // Animate solved cells with staggered delay
    emptyCells.forEach((cell, i) => {
        setTimeout(() => {
            cell.input.value = cell.value;
            cell.input.classList.add('solved', 'solved-animate');
        }, i * 25); // 25ms delay between each cell
    });
}

// Display a message below the buttons
function setMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
}

// Check if a value is valid at row, col
function isValid(board, row, col, val) {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (board[row * 9 + c] === val) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
        if (board[r * 9 + col] === val) return false;
    }

    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[(startRow + r) * 9 + (startCol + c)] === val) return false;
        }
    }

    return true;
}

// Find first empty cell index (0 = empty)
function findEmpty(board) {
    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) return i;
    }
    return -1;
}

// Backtracking solver
function solveBoard(board) {
    const emptyIndex = findEmpty(board);
    if (emptyIndex === -1) return true; // Solved

    const row = Math.floor(emptyIndex / 9);
    const col = emptyIndex % 9;

    for (let val = 1; val <= 9; val++) {
        if (isValid(board, row, col, val)) {
            board[emptyIndex] = val;
            if (solveBoard(board)) return true;
            board[emptyIndex] = 0; // backtrack
        }
    }

    return false; // no solution
}

// Solve button handler
function solveSudoku() {
    const board = readBoard();
    const solved = solveBoard(board);

    if (solved) {
        writeBoard(board);
        setMessage("Solved!");
    } else {
        setMessage("No solution found.");
    }
}

// Clear button handler
function clearGrid() {
    const inputs = document.querySelectorAll('.box input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('solved', 'solved-animate');
    });
    setMessage('');
}
