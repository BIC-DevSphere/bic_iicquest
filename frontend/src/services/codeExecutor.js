// Code execution service using Judge0 API (like LeetCode)
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = '211a5339cfmsh2fd6938cacb72e8p10ed69jsnd2c240e72fad'; // You'll need to get this from RapidAPI

// Language IDs for Judge0
const LANGUAGE_IDS = {
  python: 71,    // Python 3.8.1
  java: 62,      // Java (OpenJDK 13.0.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  cpp: 54,       // C++ (GCC 9.2.0)
  c: 50,         // C (GCC 9.2.0)
};

// Execute code using Judge0 API
export const executeCode = async (code, language = 'python', input = '') => {
  try {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Submit code for execution
    const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: input,
        expected_output: null
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`Failed to submit code: ${submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const token = submitData.token;

    // Poll for results
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      if (!resultResponse.ok) {
        throw new Error(`Failed to get results: ${resultResponse.statusText}`);
      }

      const result = await resultResponse.json();
      
      // Status codes: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded, etc.
      if (result.status.id <= 2) {
        attempts++;
        continue; // Still processing
      }

      // Execution completed
      return {
        success: result.status.id === 3, // 3 = Accepted
        output: result.stdout || '',
        error: result.stderr || result.compile_output || '',
        status: result.status.description,
        time: result.time,
        memory: result.memory,
        statusId: result.status.id
      };
    }

    throw new Error('Code execution timeout');
    
  } catch (error) {
    console.error('Code execution error:', error);
    return {
      success: false,
      output: '',
      error: error.message || 'Failed to execute code',
      status: 'Error',
      time: null,
      memory: null,
      statusId: null
    };
  }
};

// Test code against test cases
export const testCode = async (userCode, testCases, language = 'python') => {
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      // Execute only the user's code - no modifications
      const executionResult = await executeCode(userCode, language);
      
      if (!executionResult.success) {
        results.push({
          testCase: testCase.description,
          expected: testCase.expectedOutput,
          actual: executionResult.error,
          passed: false,
          error: executionResult.error,
          hint: testCase.hint,
          executionTime: executionResult.time,
          memoryUsage: executionResult.memory
        });
        continue;
      }

      // Evaluate the test case on the frontend (same logic as Piston)
      let testPassed = false;
      let actualOutput = executionResult.output.trim();
      
      if (testCase.testCode.includes('type(') && testCase.testCode.includes('==')) {
        // For type checking tests like "type(age) == int and age == 25"
        const varMatch = testCase.testCode.match(/type\((\w+)\)/);
        const expectedValue = testCase.expectedOutput;
        
        if (varMatch) {
          const varName = varMatch[1];
          const varDeclarationRegex = new RegExp(`${varName}\\s*=\\s*([^\\s#;\\n]+)`);
          const match = userCode.match(varDeclarationRegex);
          
          if (match) {
            const assignedValue = match[1].trim();
            
            if (testCase.testCode.includes('== int')) {
              const numValue = parseInt(assignedValue, 10);
              testPassed = !isNaN(numValue) && 
                          numValue.toString() === assignedValue && 
                          numValue.toString() === expectedValue.toString();
            }
            else if (testCase.testCode.includes('== str')) {
              testPassed = (assignedValue.startsWith('"') || assignedValue.startsWith("'")) &&
                          assignedValue.slice(1, -1) === expectedValue.toString();
            }
            else if (testCase.testCode.includes('== float')) {
              const floatValue = parseFloat(assignedValue);
              testPassed = !isNaN(floatValue) && 
                          floatValue.toString() === expectedValue.toString();
            }
            else if (testCase.testCode.includes('== bool')) {
              testPassed = (assignedValue === 'True' || assignedValue === 'False') &&
                          assignedValue === expectedValue.toString();
            }
          }
          
          if (testPassed) {
            actualOutput = expectedValue.toString();
          } else {
            actualOutput = match ? match[1].trim() : 'Variable not found';
          }
        }
      } 
      else if (actualOutput === testCase.expectedOutput.toString()) {
        testPassed = true;
      }
      else {
        testPassed = actualOutput === testCase.expectedOutput.toString();
      }
      
      results.push({
        testCase: testCase.description,
        expected: testCase.expectedOutput,
        actual: actualOutput,
        passed: testPassed,
        error: null,
        hint: testCase.hint,
        executionTime: executionResult.time,
        memoryUsage: executionResult.memory
      });
      
    } catch (error) {
      results.push({
        testCase: testCase.description,
        expected: testCase.expectedOutput,
        actual: '',
        passed: false,
        error: error.message,
        hint: testCase.hint,
        executionTime: null,
        memoryUsage: null
      });
    }
  }
  
  return results;
};

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

export const executeCodeWithPiston = async (code, language = 'python', version = '3.10.0') => {
  try {
    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: version,
        files: [
          {
            content: code
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: result.run.code === 0,
      output: result.run.stdout || '',
      error: result.run.stderr || '',
      status: result.run.code === 0 ? 'Success' : 'Error',
      time: null,
      memory: null
    };
    
  } catch (error) {
    console.error('Piston API error:', error);
    return {
      success: false,
      output: '',
      error: error.message || 'Failed to execute code',
      status: 'Error'
    };
  }
};

export const testCodeWithPiston = async (userCode, testCases, language = 'python') => {
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      // Execute only the user's code - no modifications
      const executionResult = await executeCodeWithPiston(userCode, language);
      
      if (!executionResult.success) {
        results.push({
          testCase: testCase.description,
          expected: testCase.expectedOutput,
          actual: executionResult.error,
          passed: false,
          error: executionResult.error,
          hint: testCase.hint
        });
        continue;
      }

      // Now evaluate the test case on the frontend
      let testPassed = false;
      let actualOutput = executionResult.output.trim();
      
      if (testCase.testCode.includes('type(') && testCase.testCode.includes('==')) {

        // Extract variable name from test code
        const varMatch = testCase.testCode.match(/type\((\w+)\)/);
        const expectedValue = testCase.expectedOutput;
        
        if (varMatch) {
          const varName = varMatch[1];
          
          // Check if the variable is declared and has the right value in the code
          const varDeclarationRegex = new RegExp(`${varName}\\s*=\\s*([^\\s#;\\n]+)`);
          const match = userCode.match(varDeclarationRegex);
          
          if (match) {
            const assignedValue = match[1].trim();
            
            // For integer type check
            if (testCase.testCode.includes('== int')) {
              const numValue = parseInt(assignedValue, 10);
              testPassed = !isNaN(numValue) && 
                          numValue.toString() === assignedValue && 
                          numValue.toString() === expectedValue.toString();
            }
            // For string type check
            else if (testCase.testCode.includes('== str')) {
              testPassed = (assignedValue.startsWith('"') || assignedValue.startsWith("'")) &&
                          assignedValue.slice(1, -1) === expectedValue.toString();
            }
            // For float type check
            else if (testCase.testCode.includes('== float')) {
              const floatValue = parseFloat(assignedValue);
              testPassed = !isNaN(floatValue) && 
                          floatValue.toString() === expectedValue.toString();
            }
            // For bool type check
            else if (testCase.testCode.includes('== bool')) {
              testPassed = (assignedValue === 'True' || assignedValue === 'False') &&
                          assignedValue === expectedValue.toString();
            }
          }
          
          if (testPassed) {
            actualOutput = expectedValue.toString();
          } else {
            actualOutput = match ? match[1].trim() : 'Variable not found';
          }
        }
      } 
      // For print output tests
      else if (actualOutput === testCase.expectedOutput.toString()) {
        testPassed = true;
      }
      // For other direct comparisons
      else {
        testPassed = actualOutput === testCase.expectedOutput.toString();
      }
      
      results.push({
        testCase: testCase.description,
        expected: testCase.expectedOutput,
        actual: actualOutput,
        passed: testPassed,
        error: null,
        hint: testCase.hint
      });
      
    } catch (error) {
      results.push({
        testCase: testCase.description,
        expected: testCase.expectedOutput,
        actual: '',
        passed: false,
        error: error.message,
        hint: testCase.hint
      });
    }
  }
  
  return results;
}; 