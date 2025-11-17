// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');

    // Generate 81 input cells
    for (let i = 0; i < 81; i++) {
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('maxlength', '1');
        input.setAttribute('data-index', i);

        // Allow only digits 1-9
        input.addEventListener('input', function () {
            this.value = this.value.replace(/[^1-9]/g, '');
        });

        grid.appendChild(input);
    }
});

// Read the grid values into a JS array
function readBoard() {
    const inputs = document.querySelectorAll('#grid input');
    const board = [];
    inputs.forEach(input => {
        const val = parseInt(input.value);
        board.push(isNaN(val) ? 0 : val);
    });
    return board;
}

// Write JS array values back to the grid
function writeBoard(board) {
    const inputs = document.querySelectorAll('#grid input');
    inputs.forEach((input, idx) => {
        input.value = board[idx] === 0 ? '' : board[idx];
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
    const inputs = document.querySelectorAll('#grid input');
    inputs.forEach(input => input.value = '');
    setMessage('');
}
