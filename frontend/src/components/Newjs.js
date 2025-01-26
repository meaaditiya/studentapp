import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../ComponentCSS/calculator.css';

const AdvancedCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [dynamicResult, setDynamicResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [scientificMode, setScientificMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const preprocessExpression = useCallback((expression) => {
    return expression
      .replace(/(\d)(\()/g, '$1*(') // Add * between a number and an opening parenthesis
      .replace(/(\))(\d)/g, ')*$2') // Add * between a closing parenthesis and a number
      .replace(/(\))(\()/g, ')*(') // Add * between consecutive parentheses
      .replace(/(\d)([a-zA-Z])/g, '$1*$2') // Add * between a number and a function (e.g., 2sin)
      .replace(/([a-zA-Z])(\d)/g, '$1*$2'); // Add * between a function and a number
  }, []);

  const safeEval = useCallback(
    (expression) => {
      try {
        const allowedChars = /^[0-9+\-*/.^%!()[\]{} a-zA-Z]*$/;
        if (!allowedChars.test(expression)) throw new Error('Invalid characters');

        const preprocessedExpression = preprocessExpression(expression);

        const factorialRegex = /(\d+)!/g;
        const evalExpression = preprocessedExpression.replace(factorialRegex, (_, num) => {
          const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));
          return factorial(parseInt(num));
        });

        return new Function(`return (${evalExpression})`)();
      } catch {
        return 'Error';
      }
    },
    [preprocessExpression]
  );

  useEffect(() => {
    if (display === 'Error') return;
    try {
      const result = safeEval(display);
      setDynamicResult(result !== 'Error' ? result : null);
      setError(null);
    } catch {
      setDynamicResult(null);
      setError('Invalid expression');
    }
  }, [display, safeEval]);

  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  }, [history]);

  const handleInput = useCallback(
    (value) => {
      setError(null);
      setDisplay((prev) =>
        prev === '0' || prev === 'Error' ? value : prev + value
      );
    },
    []
  );

  const calculateResult = useCallback(() => {
    const result = safeEval(display);

    if (result !== 'Error') {
      const calculation = {
        expression: display,
        result: result,
        timestamp: new Date().toLocaleString(),
      };
      setHistory((prev) => [calculation, ...prev].slice(0, 10));
      setDisplay(result.toString());
      setDynamicResult(null);
    } else {
      setDisplay('Error');
      setError('Calculation error');
    }
  }, [display, safeEval]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calculatorHistory');
  };

  const handleKeyPress = useCallback(
    (event) => {
      const { key } = event;

      if (/[0-9+\-*/.^%!()[\]{}]/.test(key)) {
        handleInput(key);
      }

      switch (key) {
        case 'Enter':
        case '=':
          calculateResult();
          break;
        case 'Backspace':
          setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
          break;
        case 'Escape':
          setDisplay('0');
          setError(null);
          break;
        default:
          break;
      }
    },
    [handleInput, calculateResult]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const scientificFunctions = {
    sin: (x) => Math.sin(x),
    cos: (x) => Math.cos(x),
    tan: (x) => Math.tan(x),
    log: (x) => Math.log10(x),
    ln: (x) => Math.log(x),
    sqrt: (x) => Math.sqrt(x),
    pow: (x, y) => Math.pow(x, y),
    pi: () => Math.PI,
    e: () => Math.E,
  };

  const buttons = useMemo(
    () => [
      ...(scientificMode
        ? ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pow', 'pi', 'e']
        : []),
      '(', ')', '[', ']', '{', '}', '7', '8', '9', '/', 'C',
      '4', '5', '6', '*', '⌫', '1', '2', '3', '-', '^',
      '0', '.', '=', '+', '%', '!',
    ],
    [scientificMode]
  );

  return (
    <div className="calculator-container">
      <div className="header">
        <button
          className="history-toggle"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Calculator' : 'History'}
        </button>
      </div>

      {!showHistory ? (
        <>
          <div className="display-section">
            <div className="display">{display}</div>
            {dynamicResult !== null && (
              <div className="dynamic-result">{dynamicResult}</div>
            )}
            {error && <div className="error">{error}</div>}
          </div>
          <div className="toggle-section">
            <button onClick={() => setScientificMode(!scientificMode)}>
              {scientificMode ? 'Basic' : 'Scientific'}
            </button>
          </div>
          <div className="buttons-grid">
            {buttons.map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  switch (btn) {
                    case 'C':
                      setDisplay('0');
                      setError(null);
                      break;
                    case '=':
                      calculateResult();
                      break;
                    case '⌫':
                      setDisplay((prev) =>
                        prev.length > 1 ? prev.slice(0, -1) : '0'
                      );
                      break;
                    default:
                      if (scientificFunctions[btn]) {
                        const value =
                          btn === 'pi' || btn === 'e'
                            ? scientificFunctions[btn]()
                            : `${btn}(`;
                        handleInput(value);
                      } else {
                        handleInput(btn === '^' ? '**' : btn);
                      }
                  }
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="history-section">
          <div className="history-header">
            <h3>Calculation History</h3>
            <button className="clear-history" onClick={clearHistory}>
              Clear History
            </button>
          </div>
          {history.length === 0 ? (
            <div className="no-history">No calculations yet</div>
          ) : (
            history.map((calc, index) => (
              <div key={index} className="history-item">
                <span>{calc.expression}</span>
                <span className="result">{calc.result}</span>
                <span className="timestamp">{calc.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedCalculator;
