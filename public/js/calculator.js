// Scientific Calculator JavaScript

// State variables
let currentInput = '';
let history = '';
let memory = 0;
let isDegreeMode = true;

// DOM elements
const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const degBtn = document.getElementById('degBtn');
const radBtn = document.getElementById('radBtn');

// Helper functions
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (!Number.isInteger(n)) return gamma(n + 1);
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Gamma function approximation for non-integer factorials
function gamma(z) {
    const g = 7;
    const c = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];

    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }

    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
        x += c[i] / (z + i);
    }

    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Update display
function updateDisplay() {
    display.value = currentInput || '0';
    historyDisplay.textContent = history;
}

// Append value to input
function appendValue(value) {
    currentInput += value;
    updateDisplay();
}

// Append function with opening parenthesis
function appendFunction(func) {
    currentInput += func;
    updateDisplay();
}

// Clear all
function clearAll() {
    currentInput = '';
    history = '';
    updateDisplay();
}

// Delete last character
function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

// Toggle sign
function toggleSign() {
    if (currentInput) {
        if (currentInput.startsWith('-')) {
            currentInput = currentInput.substring(1);
        } else {
            currentInput = '-' + currentInput;
        }
        updateDisplay();
    }
}

// Mode toggles
function setDegMode() {
    isDegreeMode = true;
    degBtn.classList.add('active');
    radBtn.classList.remove('active');
}

function setRadMode() {
    isDegreeMode = false;
    radBtn.classList.add('active');
    degBtn.classList.remove('active');
}

// Memory functions
function memoryClear() {
    memory = 0;
}

function memoryRecall() {
    currentInput += memory.toString();
    updateDisplay();
}

function memoryAdd() {
    try {
        const result = evaluateExpression(currentInput);
        if (!isNaN(result)) {
            memory += result;
        }
    } catch (e) {
        console.warn('Memory add failed:', e.message);
    }
}

function memorySubtract() {
    try {
        const result = evaluateExpression(currentInput);
        if (!isNaN(result)) {
            memory -= result;
        }
    } catch (e) {
        console.warn('Memory subtract failed:', e.message);
    }
}

// Whitelist of allowed tokens for safe expression parsing
const ALLOWED_TOKENS = /^[\d\s+\-*/().^%e]|Math\.(PI|E|sin|cos|tan|asin|acos|atan|sqrt|cbrt|log10|log|exp|abs|pow)|toRadians|toDegrees|factorial$/;

// Validate expression contains only safe tokens
function validateExpression(expr) {
    // Remove all whitespace
    const normalized = expr.replace(/\s+/g, '');
    
    // Check for dangerous patterns
    const dangerousPatterns = [
        /\beval\b/i,
        /\bFunction\b/i,
        /\bconstructor\b/i,
        /\bprototype\b/i,
        /\b__proto__\b/i,
        /\bwindow\b/i,
        /\bdocument\b/i,
        /\bglobal\b/i,
        /\bprocess\b/i,
        /\brequire\b/i,
        /\bimport\b/i,
        /\bexport\b/i,
        /\bthis\b/i,
        /\bnew\b/i,
        /\bdelete\b/i,
        /\breturn\b/,
        /[;{}[\]\\`$]/,
        /=(?!=)/,  // Assignment (but not ==)
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(normalized)) {
            throw new Error('Invalid expression');
        }
    }
    
    return true;
}

// Evaluate expression safely
function evaluateExpression(expr) {
    // Replace display symbols with JavaScript operators
    let processedExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**')
        .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');  // Handle percentage: 5% becomes (5/100)
    
    // Handle trigonometric functions based on mode
    if (isDegreeMode) {
        // Convert degree input to radians for trig functions
        processedExpr = processedExpr
            .replace(/sin\(([^)]+)\)/g, 'Math.sin(toRadians($1))')
            .replace(/cos\(([^)]+)\)/g, 'Math.cos(toRadians($1))')
            .replace(/tan\(([^)]+)\)/g, 'Math.tan(toRadians($1))')
            .replace(/asin\(([^)]+)\)/g, 'toDegrees(Math.asin($1))')
            .replace(/acos\(([^)]+)\)/g, 'toDegrees(Math.acos($1))')
            .replace(/atan\(([^)]+)\)/g, 'toDegrees(Math.atan($1))');
    } else {
        processedExpr = processedExpr
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/asin\(/g, 'Math.asin(')
            .replace(/acos\(/g, 'Math.acos(')
            .replace(/atan\(/g, 'Math.atan(');
    }
    
    // Replace other math functions
    processedExpr = processedExpr
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/cbrt\(/g, 'Math.cbrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/abs\(/g, 'Math.abs(');

    // Validate expression before evaluation
    validateExpression(processedExpr);

    // Create a safe evaluation context with only allowed functions
    const safeContext = {
        Math: {
            PI: Math.PI,
            E: Math.E,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt,
            log10: Math.log10,
            log: Math.log,
            exp: Math.exp,
            abs: Math.abs,
            pow: Math.pow
        },
        toRadians: toRadians,
        toDegrees: toDegrees,
        factorial: factorial
    };

    // Use Function constructor with validated expression and restricted context
    const safeEval = new Function(
        'Math', 'toRadians', 'toDegrees', 'factorial',
        `"use strict"; return (${processedExpr});`
    );
    
    return safeEval(safeContext.Math, safeContext.toRadians, safeContext.toDegrees, safeContext.factorial);
}

// Calculate result
function calculate() {
    if (!currentInput) return;
    
    try {
        const result = evaluateExpression(currentInput);
        
        if (isNaN(result)) {
            history = currentInput + ' =';
            currentInput = 'Error';
        } else if (!isFinite(result)) {
            history = currentInput + ' =';
            currentInput = result > 0 ? 'Infinity' : '-Infinity';
        } else {
            history = currentInput + ' =';
            // Round to avoid floating point precision issues
            currentInput = parseFloat(result.toPrecision(12)).toString();
        }
        
        updateDisplay();
    } catch (error) {
        history = currentInput;
        currentInput = 'Error';
        updateDisplay();
    }
}

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (/[0-9.]/.test(key)) {
        appendValue(key);
    } else if (key === '+') {
        appendValue('+');
    } else if (key === '-') {
        appendValue('-');
    } else if (key === '*') {
        appendValue('*');
    } else if (key === '/') {
        appendValue('/');
    } else if (key === '%') {
        appendValue('%');
    } else if (key === '^') {
        appendValue('^');
    } else if (key === '(' || key === ')') {
        appendValue(key);
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// Initialize display
updateDisplay();
