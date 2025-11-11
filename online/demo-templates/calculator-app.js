export const calculatorApp = {
  templateName: "Calculator App",
  description: "A beautiful calculator built with vanilla JavaScript",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "calculator-demo",
  "version": "1.0.0",
  "type": "module"
}`,
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calculator Demo</title>
    <link rel="stylesheet" href="src/style.css" />
  </head>
  <body>
    <div class="calculator">
      <div class="display">
        <div class="previous-operand" id="previous-operand"></div>
        <div class="current-operand" id="current-operand">0</div>
      </div>
      
      <div class="buttons">
        <button class="btn clear" onclick="calculator.clear()">AC</button>
        <button class="btn clear" onclick="calculator.delete()">⌫</button>
        <button class="btn operator" onclick="calculator.chooseOperation('÷')">÷</button>
        <button class="btn operator" onclick="calculator.chooseOperation('×')">×</button>
        
        <button class="btn number" onclick="calculator.appendNumber('7')">7</button>
        <button class="btn number" onclick="calculator.appendNumber('8')">8</button>
        <button class="btn number" onclick="calculator.appendNumber('9')">9</button>
        <button class="btn operator" onclick="calculator.chooseOperation('-')">−</button>
        
        <button class="btn number" onclick="calculator.appendNumber('4')">4</button>
        <button class="btn number" onclick="calculator.appendNumber('5')">5</button>
        <button class="btn number" onclick="calculator.appendNumber('6')">6</button>
        <button class="btn operator" onclick="calculator.chooseOperation('+')">+</button>
        
        <button class="btn number" onclick="calculator.appendNumber('1')">1</button>
        <button class="btn number" onclick="calculator.appendNumber('2')">2</button>
        <button class="btn number" onclick="calculator.appendNumber('3')">3</button>
        <button class="btn equals span-two" onclick="calculator.compute()">=</button>
        
        <button class="btn number span-two" onclick="calculator.appendNumber('0')">0</button>
        <button class="btn number" onclick="calculator.appendNumber('.')">.</button>
      </div>
    </div>
    
    <script src="src/calculator.js"></script>
  </body>
</html>`,
    },
    {
      path: "src/style.css",
      content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.calculator {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 25px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 350px;
  width: 100%;
}

.display {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: right;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.previous-operand {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  min-height: 1.5rem;
}

.current-operand {
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  min-height: 2.5rem;
  word-break: break-all;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.btn {
  border: none;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: 500;
  height: 70px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn:active {
  transform: translateY(0);
  background: rgba(255, 255, 255, 0.3);
}

.btn.number {
  background: rgba(255, 255, 255, 0.15);
}

.btn.operator {
  background: rgba(255, 165, 0, 0.3);
  border: 1px solid rgba(255, 165, 0, 0.4);
}

.btn.operator:hover {
  background: rgba(255, 165, 0, 0.4);
}

.btn.equals {
  background: rgba(34, 197, 94, 0.3);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.btn.equals:hover {
  background: rgba(34, 197, 94, 0.4);
}

.btn.clear {
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.btn.clear:hover {
  background: rgba(239, 68, 68, 0.4);
}

.span-two {
  grid-column: span 2;
}

@media (max-width: 400px) {
  .calculator {
    padding: 20px;
    margin: 10px;
  }
  
  .btn {
    height: 60px;
    font-size: 1.3rem;
  }
  
  .current-operand {
    font-size: 2rem;
  }
  
  .buttons {
    gap: 10px;
  }
}

/* Add some visual feedback for calculations */
.calculating {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.error {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}`,
    },
    {
      path: "src/calculator.js",
      content: `class Calculator {
  constructor() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
    this.updateDisplay();
    this.setupKeyboardSupport();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  delete() {
    if (this.shouldResetScreen) {
      this.clear();
      return;
    }
    
    if (this.currentOperand.length === 1) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  appendNumber(number) {
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
    }

    if (number === '.' && this.currentOperand.includes('.')) return;
    
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand += number;
    }
    
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentOperand === '') return;
    
    if (this.previousOperand !== '') {
      this.compute();
    }
    
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    
    if (isNaN(prev) || isNaN(current)) return;

    // Add visual feedback
    document.querySelector('.calculator').classList.add('calculating');
    setTimeout(() => {
      document.querySelector('.calculator').classList.remove('calculating');
    }, 500);

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
        computation = prev - current;
        break;
      case '×':
        computation = prev * current;
        break;
      case '÷':
        if (current === 0) {
          this.showError();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Round to avoid floating point precision issues
    computation = Math.round((computation + Number.EPSILON) * 100000000) / 100000000;
    
    this.currentOperand = computation.toString();
    this.operation = null;
    this.previousOperand = '';
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  showError() {
    document.querySelector('.calculator').classList.add('error');
    setTimeout(() => {
      document.querySelector('.calculator').classList.remove('error');
    }, 500);
    
    this.currentOperand = 'Error';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', {
        maximumFractionDigits: 0
      });
    }
    
    if (decimalDigits != null) {
      return \`\${integerDisplay}.\${decimalDigits}\`;
    } else {
      return integerDisplay;
    }
  }

  updateDisplay() {
    const currentElement = document.getElementById('current-operand');
    const previousElement = document.getElementById('previous-operand');
    
    if (this.currentOperand === 'Error') {
      currentElement.textContent = this.currentOperand;
    } else {
      currentElement.textContent = this.getDisplayNumber(this.currentOperand);
    }
    
    if (this.operation != null) {
      previousElement.textContent = 
        \`\${this.getDisplayNumber(this.previousOperand)} \${this.operation}\`;
    } else {
      previousElement.textContent = '';
    }
  }

  setupKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
      // Prevent default for calculator keys
      if ('0123456789.-+*/=Enter BackspaceEscape'.includes(e.key)) {
        e.preventDefault();
      }

      if (e.key >= '0' && e.key <= '9') {
        this.appendNumber(e.key);
      }
      
      if (e.key === '.') {
        this.appendNumber(e.key);
      }
      
      if (e.key === '+') {
        this.chooseOperation('+');
      }
      
      if (e.key === '-') {
        this.chooseOperation('−');
      }
      
      if (e.key === '*') {
        this.chooseOperation('×');
      }
      
      if (e.key === '/') {
        this.chooseOperation('÷');
      }
      
      if (e.key === 'Enter' || e.key === '=') {
        this.compute();
      }
      
      if (e.key === 'Backspace') {
        this.delete();
      }
      
      if (e.key === 'Escape') {
        this.clear();
      }
    });
  }
}

// Initialize calculator
const calculator = new Calculator();

// Make calculator globally available for button clicks
window.calculator = calculator;

// Add some fun easter eggs
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.code);
  if (konamiCode.length > konamiSequence.length) {
    konamiCode.shift();
  }
  
  if (konamiCode.join(',') === konamiSequence.join(',')) {
    document.body.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)';
    setTimeout(() => {
      document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 3000);
    konamiCode = [];
  }
});`,
    },
  ],
};
