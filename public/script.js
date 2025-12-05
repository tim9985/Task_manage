// 디스플레이 요소 가져오기
const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression');

// 각도 모드 (deg: 도, rad: 라디안)
let angleMode = 'deg';

// 메모리 값
let memoryValue = 0;

// 각도 모드 설정
function setAngleMode(mode) {
    angleMode = mode;
    document.getElementById('degBtn').classList.toggle('active', mode === 'deg');
    document.getElementById('radBtn').classList.toggle('active', mode === 'rad');
}

// 도를 라디안으로 변환
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// 라디안을 도로 변환
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

// 디스플레이에 값 추가
function appendToDisplay(value) {
    if (display.value === '0' && value !== '.' && !isNaN(value)) {
        display.value = value;
    } else if (display.value === 'Error' || display.value === 'Infinity' || display.value === '-Infinity') {
        display.value = value;
    } else {
        display.value += value;
    }
}

// 함수 추가 (sin(, cos( 등)
function appendFunction(func) {
    if (display.value === '0' || display.value === 'Error') {
        display.value = func;
    } else {
        display.value += func;
    }
}

// 상수 추가
function appendConstant(constant) {
    let value;
    if (constant === 'pi') {
        value = Math.PI.toString();
    } else if (constant === 'e') {
        value = Math.E.toString();
    }
    
    if (display.value === '0' || display.value === 'Error') {
        display.value = value;
    } else {
        display.value += value;
    }
}

// 디스플레이 초기화
function clearDisplay() {
    display.value = '';
    expressionDisplay.textContent = '';
}

// 마지막 문자 삭제
function deleteLast() {
    if (display.value === 'Error') {
        display.value = '';
    } else {
        display.value = display.value.slice(0, -1);
    }
}

// 부호 변경
function toggleSign() {
    if (display.value && display.value !== '0' && display.value !== 'Error') {
        if (display.value.startsWith('-')) {
            display.value = display.value.substring(1);
        } else {
            display.value = '-' + display.value;
        }
    }
}

// 역수 계산
function calculateReciprocal() {
    try {
        const value = evaluateExpression(display.value);
        if (value === 0) {
            display.value = 'Error';
        } else {
            expressionDisplay.textContent = `1/(${display.value})`;
            display.value = formatResult(1 / value);
        }
    } catch {
        display.value = 'Error';
    }
}

// 팩토리얼 계산
function calculateFactorial() {
    try {
        const value = evaluateExpression(display.value);
        const intValue = Math.floor(value);
        if (intValue < 0 || intValue > 170) {
            display.value = 'Error';
            return;
        }
        expressionDisplay.textContent = `${intValue}!`;
        display.value = formatResult(factorial(intValue));
    } catch {
        display.value = 'Error';
    }
}

// 팩토리얼 함수
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// 메모리 저장
function memorySave() {
    try {
        memoryValue = evaluateExpression(display.value) || 0;
    } catch {
        memoryValue = 0;
    }
}

// 메모리 불러오기
function memoryRecall() {
    if (display.value === '0' || display.value === '' || display.value === 'Error') {
        display.value = memoryValue.toString();
    } else {
        display.value += memoryValue.toString();
    }
}

// 결과 포맷팅
function formatResult(result) {
    if (isNaN(result) || !isFinite(result)) {
        return 'Error';
    }
    // 매우 큰 수나 매우 작은 수는 지수 표기법 사용
    if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
        return result.toExponential(10);
    }
    return parseFloat(result.toPrecision(15)).toString();
}

// 안전한 수식 파서 및 계산기
function evaluateExpression(expression) {
    // 먼저 과학 함수들을 처리
    expression = processFunctions(expression);
    
    // 거듭제곱 연산자 처리
    expression = processPower(expression);
    
    // 퍼센트 처리
    expression = processPercent(expression);
    
    return calculateBasic(expression);
}

// 과학 함수 처리
function processFunctions(expr) {
    const functions = {
        'sin': (x) => angleMode === 'deg' ? Math.sin(toRadians(x)) : Math.sin(x),
        'cos': (x) => angleMode === 'deg' ? Math.cos(toRadians(x)) : Math.cos(x),
        'tan': (x) => angleMode === 'deg' ? Math.tan(toRadians(x)) : Math.tan(x),
        'asin': (x) => angleMode === 'deg' ? toDegrees(Math.asin(x)) : Math.asin(x),
        'acos': (x) => angleMode === 'deg' ? toDegrees(Math.acos(x)) : Math.acos(x),
        'atan': (x) => angleMode === 'deg' ? toDegrees(Math.atan(x)) : Math.atan(x),
        'log': (x) => Math.log10(x),
        'ln': (x) => Math.log(x),
        'sqrt': (x) => Math.sqrt(x),
        'cbrt': (x) => Math.cbrt(x),
        'abs': (x) => Math.abs(x),
        'exp': (x) => Math.exp(x),
        '10^': (x) => Math.pow(10, x)
    };
    
    let result = expr;
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;
    
    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;
        
        for (const [funcName, func] of Object.entries(functions)) {
            const regex = new RegExp(funcName.replace('^', '\\^') + '\\(([^()]+)\\)', 'g');
            const newResult = result.replace(regex, (match, inner) => {
                changed = true;
                const innerValue = calculateBasic(processPower(inner));
                return func(innerValue).toString();
            });
            result = newResult;
        }
    }
    
    return result;
}

// 거듭제곱 처리
function processPower(expr) {
    // ^연산자를 찾아서 처리
    let result = expr;
    const powerRegex = /(-?\d+\.?\d*)\^(-?\d+\.?\d*)/;
    
    let match;
    let iterations = 0;
    const maxIterations = 100;
    
    while ((match = result.match(powerRegex)) && iterations < maxIterations) {
        iterations++;
        const base = parseFloat(match[1]);
        const exponent = parseFloat(match[2]);
        const power = Math.pow(base, exponent);
        result = result.replace(match[0], power.toString());
    }
    
    return result;
}

// 퍼센트 처리
function processPercent(expr) {
    return expr.replace(/(\d+\.?\d*)%/g, (match, num) => {
        return (parseFloat(num) / 100).toString();
    });
}

// 기본 사칙연산 계산
function calculateBasic(expression) {
    // 괄호 먼저 처리
    let result = expression;
    const parenRegex = /\(([^()]+)\)/;
    let match;
    let iterations = 0;
    const maxIterations = 100;
    
    while ((match = result.match(parenRegex)) && iterations < maxIterations) {
        iterations++;
        const innerResult = calculateWithoutParentheses(match[1]);
        result = result.replace(match[0], innerResult.toString());
    }
    
    return calculateWithoutParentheses(result);
}

// 괄호 없는 기본 연산
function calculateWithoutParentheses(expression) {
    // 토큰화
    const tokens = [];
    let currentNumber = '';
    
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        
        if (/[0-9.eE]/.test(char) || (char === '-' && (i === 0 || '+-*/'.includes(expression[i-1])))) {
            currentNumber += char;
        } else if (['+', '-', '*', '/'].includes(char)) {
            if (currentNumber !== '') {
                tokens.push(parseFloat(currentNumber));
                currentNumber = '';
            }
            tokens.push(char);
        }
    }
    
    if (currentNumber !== '') {
        tokens.push(parseFloat(currentNumber));
    }
    
    // 유효성 검사
    if (tokens.length === 0) return 0;
    if (tokens.length === 1) return tokens[0];
    
    // 곱셈과 나눗셈 먼저 처리
    let i = 0;
    while (i < tokens.length) {
        if (tokens[i] === '*' || tokens[i] === '/') {
            const left = tokens[i - 1];
            const right = tokens[i + 1];
            let calcResult;
            
            if (tokens[i] === '*') {
                calcResult = left * right;
            } else {
                if (right === 0) return NaN;
                calcResult = left / right;
            }
            
            tokens.splice(i - 1, 3, calcResult);
            i--;
        }
        i++;
    }
    
    // 덧셈과 뺄셈 처리
    i = 0;
    while (i < tokens.length) {
        if (tokens[i] === '+' || tokens[i] === '-') {
            const left = tokens[i - 1];
            const right = tokens[i + 1];
            let calcResult;
            
            if (tokens[i] === '+') {
                calcResult = left + right;
            } else {
                calcResult = left - right;
            }
            
            tokens.splice(i - 1, 3, calcResult);
            i--;
        }
        i++;
    }
    
    return tokens[0];
}

// 계산 수행
function calculate() {
    try {
        if (display.value === '' || display.value === 'Error') {
            display.value = '0';
            return;
        }
        
        // 수식 저장
        expressionDisplay.textContent = display.value;
        
        // 보안을 위해 허용된 문자만 사용
        const sanitized = display.value.replace(/[^0-9+\-*/.^()%sincotalgbqrexpE]/g, '');
        
        // 빈 문자열이면 0 반환
        if (sanitized === '') {
            display.value = '0';
            return;
        }
        
        // 안전한 파서로 계산 수행
        const result = evaluateExpression(sanitized);
        
        // 결과 표시
        display.value = formatResult(result);
    } catch {
        display.value = 'Error';
    }
}

// 키보드 입력 지원
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (/[0-9]/.test(key)) {
        appendToDisplay(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '(' || key === ')') {
        appendToDisplay(key);
    } else if (key === '^') {
        appendToDisplay('^');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'p') {
        appendConstant('pi');
    } else if (key === 'e' && !event.ctrlKey) {
        appendConstant('e');
    }
});
