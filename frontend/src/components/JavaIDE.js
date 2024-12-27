import React, { useState, useRef } from 'react';
import Editor from "@monaco-editor/react";
import Split from 'react-split';
import './Javaide.css'
const InteractiveJavaIDE = () => {
  const defaultCode = `import java.util.*;
import java.io.*;
import java.math.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter two numbers:");
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("Sum is: " + (a + b));
    }
}`;

  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputBuffer, setInputBuffer] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "", actualOutput: "", status: "" }
  ]);
  
  const inputRef = useRef(null);

  // Simulated input/output handling
  const handleInput = (e) => {
    if (e.key === 'Enter' && waitingForInput) {
      const newInput = e.target.value.trim();
      setInputBuffer(prev => [...prev, newInput]);
      setInput("");
      setWaitingForInput(false);
      setOutput(prev => prev + newInput + "\n");
      continueExecution(newInput);
    }
  };

  const simulateCodeExecution = async (inputs = []) => {
    setIsRunning(true);
    setOutput("");
    setWaitingForInput(false);
    setInputBuffer([]);

    try {
      const response = await fetch("http://192.168.1.41:5000/run-java", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code,
          inputs: inputs,
          className: "Main"
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setOutput(data.error);
      } else if (data.needsInput) {
        setCurrentPrompt(data.prompt);
        setWaitingForInput(true);
        setOutput(prev => prev + data.output);
        inputRef.current?.focus();
      } else {
        setOutput(data.output);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
    
    setIsRunning(false);
  };

  const continueExecution = (providedInput) => {
    // Simulate continuing execution with the provided input
    simulateCodeExecution([...inputBuffer, providedInput]);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setError("");
    
    try {
        const response = await fetch(`${API_URL}/run-java`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ 
                code,
                inputs: [],
                className: "Main"
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            setError(data.error);
            setOutput("");
        } else {
            setOutput(data.output);
            setError("");
        }
    } catch (error) {
        setError(`Connection error: ${error.message}. Make sure the server is running on port 5000`);
        console.error("Full error:", error);
    } finally {
        setIsRunning(false);
    }
};

  const handleRunTests = async () => {
    setIsRunning(true);
    const updatedTestCases = [...testCases];

    for (let i = 0; i < testCases.length; i++) {
      try {
        const inputs = testCases[i].input.split('\n');
        const API_URL = process.env.NODE_ENV === 'production' 
  ? 'http://http://192.168.1.41:5000'
  : 'http://localhost:5000';

// Then use it in your fetch calls:
const response = await fetch(`${API_URL}/run-java`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({ 
        code,
        inputs,
        className: 'Main'
    })
});
        const data = await response.json();
        const output = data.error || data.output;
        updatedTestCases[i] = {
          ...testCases[i],
          actualOutput: output,
          status: output.trim() === testCases[i].expectedOutput.trim() ? "PASSED" : "FAILED"
        };
      } catch (error) {
        updatedTestCases[i] = {
          ...testCases[i],
          actualOutput: `Error: ${error.message}`,
          status: "ERROR"
        };
      }
    }

    setTestCases(updatedTestCases);
    setIsRunning(false);
  };

  return (
    <div className="h-screen bg-gray-900 text-white">
      <Split className="h-full flex" sizes={[70, 30]} minSize={[400, 200]}>
        {/* Left panel - Code Editor */}
        <div className="h-full flex flex-col">
          <div className="flex-grow">
            <Editor
              height="100%"
              defaultLanguage="java"
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: "on",
                rulers: [80],
                bracketPairColorization: { enabled: true },
                automaticLayout: true,
                tabSize: 4
              }}
            />
          </div>
        </div>

        {/* Right panel - Input/Output and Test Cases */}
        <div className="h-full flex flex-col bg-gray-800 p-4">
          {/* Controls */}
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded ${isRunning ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              className={`px-4 py-2 rounded ${isRunning ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              onClick={handleRunTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>

          {/* Interactive Console */}
          <div className="flex-1 mb-4 bg-black rounded p-2 font-mono overflow-auto">
            <div className="whitespace-pre-wrap">{output}</div>
            {waitingForInput && (
              <div className="flex items-center">
                <span className="text-green-400">➜ </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInput}
                  className="flex-1 bg-transparent outline-none ml-2"
                  placeholder="Enter your input..."
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Test Cases */}
          <div className="flex-1 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Test Cases</h3>
              <button
                className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                onClick={() => setTestCases([...testCases, { input: "", expectedOutput: "", actualOutput: "", status: "" }])}
              >
                Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded">
                  <div className="flex justify-between mb-2">
                    <span>Test Case {index + 1}</span>
                    <button
                      className="text-red-400 text-sm"
                      onClick={() => setTestCases(testCases.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </div>

                  <textarea
                    className="w-full bg-gray-800 p-2 rounded mb-2 font-mono"
                    placeholder="Input (one per line)"
                    rows={2}
                    value={testCase.input}
                    onChange={e => {
                      const newTestCases = [...testCases];
                      newTestCases[index].input = e.target.value;
                      setTestCases(newTestCases);
                    }}
                  />

                  <textarea
                    className="w-full bg-gray-800 p-2 rounded mb-2 font-mono"
                    placeholder="Expected Output"
                    rows={2}
                    value={testCase.expectedOutput}
                    onChange={e => {
                      const newTestCases = [...testCases];
                      newTestCases[index].expectedOutput = e.target.value;
                      setTestCases(newTestCases);
                    }}
                  />

                  {testCase.actualOutput && (
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-sm mb-1">Actual Output:</div>
                      <pre className="text-sm whitespace-pre-wrap">{testCase.actualOutput}</pre>
                      <div className={`mt-1 text-sm font-bold ${
                        testCase.status === "PASSED" ? "text-green-400" :
                        testCase.status === "FAILED" ? "text-red-400" :
                        "text-yellow-400"
                      }`}>
                        Status: {testCase.status}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Split>
    </div>
  );
};

export default InteractiveJavaIDE;