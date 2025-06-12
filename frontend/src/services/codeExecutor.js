// Code execution service using Judge0 API (like LeetCode)
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = '211a5339cfmsh2fd6938cacb72e8p10ed69jsnd2c240e72fad'; // You'll need to get this from RapidAPI

// Language IDs for Judge0
const LANGUAGE_IDS = {
  python: 71,    // Python 3.8.1
  java: 62,      // Java (OpenJDK 13.0.1)
  javascript: 93, // JavaScript (Node.js 18.15.0)
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
    // Map language to Piston's supported versions
    const languageVersions = {
      python: '3.10.0',
      javascript: '18.15.0',
      java: '19.0.2',
      cpp: '10.2.0',
      c: '10.2.0'
    };

    const pistonVersion = languageVersions[language.toLowerCase()] || version;

    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: pistonVersion,
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

// Run a single test case
export const runSingleTestCase = async (userCode, testCase, testIndex, language = 'python') => {
  try {
    let testPassed = false;
    let actualOutput = '';
    let executionError = null;
    
    // Create a complete test script that includes the user code + test execution
    let fullTestCode = '';
    
    if (language === 'javascript') {
      // Remove any existing console.log statements from user code to avoid double output
      // Use a more robust function to handle nested parentheses
      const removeConsoleLogs = (code) => {
        const lines = code.split('\n');
        return lines.filter(line => !line.trim().startsWith('console.log')).join('\n');
      };
      const cleanUserCode = removeConsoleLogs(userCode);
      
      // For JavaScript type checking
      if (testCase.description.toLowerCase().includes('string') || testCase.expectedOutput === 'string') {
        // Try to find any string variable in the code
        const stringVarMatch = cleanUserCode.match(/(let|var|const)\s+(\w+)\s*=\s*["'`][^"'`]*["'`]/);
        const varName = stringVarMatch ? stringVarMatch[2] : 'name';
        
        fullTestCode = `
${cleanUserCode}

try {
  if (typeof ${varName} !== 'undefined') {
    console.log(typeof ${varName});
  } else if (typeof name !== 'undefined') {
    console.log(typeof name);
  } else {
    console.log('ERROR: No string variable found');
  }
} catch (error) {
  console.log('ERROR: ' + error.message);
}
`;
      } else if (testCase.description.toLowerCase().includes('number') || testCase.expectedOutput === 'number') {
        // Try to find any number variable in the code
        const numberVarMatch = cleanUserCode.match(/(let|var|const)\s+(\w+)\s*=\s*\d+/);
        const varName = numberVarMatch ? numberVarMatch[2] : 'age';
        
        fullTestCode = `
${cleanUserCode}

try {
  if (typeof ${varName} !== 'undefined') {
    console.log(typeof ${varName});
  } else if (typeof age !== 'undefined') {
    console.log(typeof age);
  } else {
    console.log('ERROR: No number variable found');
  }
} catch (error) {
  console.log('ERROR: ' + error.message);
}
`;
      } else {
        // General test case execution
        fullTestCode = `
${userCode}

try {
  ${testCase.testCode}
} catch (error) {
  console.log('ERROR: ' + error.message);
}
`;
      }
    } else if (language === 'python') {
      // Remove any existing print statements from user code to avoid double output
      const removePrintStatements = (code) => {
        const lines = code.split('\n');
        return lines.filter(line => !line.trim().startsWith('print(')).join('\n');
      };
      const cleanUserCode = removePrintStatements(userCode);
      
      // For Python type checking - execute the test code directly
      if (testCase.description.toLowerCase().includes('string') || testCase.expectedOutput === 'str') {
        // Try to find any string variable in the code
        const stringVarMatch = cleanUserCode.match(/(\w+)\s*=\s*["'][^"']*["']/);
        const varName = stringVarMatch ? stringVarMatch[1] : 'name';
        
        fullTestCode = `
${cleanUserCode}

try:
    if '${varName}' in locals() or '${varName}' in globals():
        print(type(${varName}).__name__)
    elif 'name' in locals() or 'name' in globals():
        print(type(name).__name__)
    else:
        print("ERROR: No string variable found")
except Exception as e:
    print("ERROR: " + str(e))
`;
      } else if (testCase.description.toLowerCase().includes('number') || testCase.expectedOutput === 'int') {
        // Try to find any number variable in the code
        const numberVarMatch = cleanUserCode.match(/(\w+)\s*=\s*\d+/);
        const varName = numberVarMatch ? numberVarMatch[1] : 'age';
        
        fullTestCode = `
${cleanUserCode}

try:
    if '${varName}' in locals() or '${varName}' in globals():
        print(type(${varName}).__name__)
    elif 'age' in locals() or 'age' in globals():
        print(type(age).__name__)
    else:
        print("ERROR: No number variable found")
except Exception as e:
    print("ERROR: " + str(e))
`;
      } else {
        // Execute the test code directly
        fullTestCode = `
${userCode}

try:
    ${testCase.testCode}
except Exception as e:
    print("ERROR: " + str(e))
`;
      }
    } else {
      // For other languages
      fullTestCode = `
${userCode}

${testCase.testCode}
`;
    }
    
    console.log(`Test ${testIndex + 1} executing:`, fullTestCode);
    
    // Execute the complete test
    const executionResult = await executeCodeWithPiston(fullTestCode, language);
    
    if (!executionResult.success) {
      return {
        testCase: testCase.description,
        expected: testCase.expectedOutput,
        actual: executionResult.error,
        passed: false,
        error: executionResult.error,
        hint: testCase.hint,
        index: testIndex
      };
    }
    
    actualOutput = executionResult.output.trim();
    console.log(`Test ${testIndex + 1} output:`, actualOutput, `Expected:`, testCase.expectedOutput);
    
    // Check if there was an execution error
    if (actualOutput.startsWith('ERROR:')) {
      testPassed = false;
      executionError = actualOutput.replace('ERROR: ', '');
      actualOutput = executionError;
    } else {
      // Normalize the comparison
      const expectedStr = testCase.expectedOutput.toString().trim();
      const actualStr = actualOutput.trim();
      
      testPassed = actualStr === expectedStr;
    }
    
    return {
      testCase: testCase.description,
      expected: testCase.expectedOutput,
      actual: actualOutput,
      passed: testPassed,
      error: executionError,
      hint: testCase.hint,
      index: testIndex
    };
    
  } catch (error) {
    console.error(`Error in test ${testIndex + 1}:`, error);
    return {
      testCase: testCase.description,
      expected: testCase.expectedOutput,
      actual: '',
      passed: false,
      error: error.message,
      hint: testCase.hint,
      index: testIndex
    };
  }
};

// Test code with Piston API (free alternative) - runs all tests sequentially
export const testCodeWithPiston = async (userCode, testCases, language = 'python') => {
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const result = await runSingleTestCase(userCode, testCases[i], i, language);
    results.push(result);
  }
  
  return results;
}; 