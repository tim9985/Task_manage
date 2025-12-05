// 디스플레이 요소 가져오기
const display = document.getElementById('display');

// 디스플레이에 값 추가
function appendToDisplay(value) {
    if (display.value === '0' && value !== '.') {
        display.value = value;
    } else {
        display.value += value;
    }
}

// 디스플레이 초기화
function clearDisplay() {
    display.value = '';
}

// 마지막 문자 삭제
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// 안전한 수식 파서 및 계산기
function evaluateExpression(expression) {
    // 토큰화
    const tokens = [];
    let currentNumber = '';
    
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        
        if (/[0-9.]/.test(char)) {
            currentNumber += char;
        } else if (['+', '-', '*', '/'].includes(char)) {
            if (currentNumber !== '') {
                tokens.push(parseFloat(currentNumber));
                currentNumber = '';
            } else if (char === '-' && (tokens.length === 0 || typeof tokens[tokens.length - 1] === 'string')) {
                // 음수 처리
                currentNumber = '-';
                continue;
            }
            tokens.push(char);
        }
    }
    
    if (currentNumber !== '') {
        tokens.push(parseFloat(currentNumber));
    }
    
    // 유효성 검사
    if (tokens.length === 0) return 0;
    
    // 곱셈과 나눗셈 먼저 처리
    let i = 0;
    while (i < tokens.length) {
        if (tokens[i] === '*' || tokens[i] === '/') {
            const left = tokens[i - 1];
            const right = tokens[i + 1];
            let result;
            
            if (tokens[i] === '*') {
                result = left * right;
            } else {
                if (right === 0) return NaN;
                result = left / right;
            }
            
            tokens.splice(i - 1, 3, result);
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
            let result;
            
            if (tokens[i] === '+') {
                result = left + right;
            } else {
                result = left - right;
            }
            
            tokens.splice(i - 1, 3, result);
            i--;
        }
        i++;
    }
    
    return tokens[0];
}

// 계산 수행
function calculate() {
    try {
        if (display.value === '') {
            display.value = '0';
            return;
        }
        
        // 보안을 위해 허용된 문자만 사용
        const sanitized = display.value.replace(/[^0-9+\-*/.]/g, '');
        
        // 빈 문자열이면 0 반환
        if (sanitized === '') {
            display.value = '0';
            return;
        }
        
        // 안전한 파서로 계산 수행
        const result = evaluateExpression(sanitized);
        
        // 결과가 유효한지 확인
        if (isNaN(result) || !isFinite(result)) {
            display.value = 'Error';
        } else {
            // 소수점 자릿수 제한 (최대 10자리)
            display.value = parseFloat(result.toFixed(10)).toString();
        }
    } catch (error) {
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
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});
