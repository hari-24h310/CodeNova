import { Router } from 'express';
import zlib from 'zlib';
import crypto from 'crypto';
import util from 'util';
import Question from '../models/Question.js';
import Assessment from '../models/Assessment.js';

const deflateRaw = util.promisify(zlib.deflateRaw);

const router = Router();

function readsStandardInput(sourceCode, languageId, skill) {
  if (skill === 'SQL') return true;
  const patterns = {
    50: /scanf\s*\(|fgets\s*\(/i,
    54: /\bcin\s*>>/i,
    62: /Scanner|BufferedReader|readLine\s*\(/i,
    71: /input\s*\(|sys\.stdin/i,
    63: /readFileSync\s*\([^)]*\b0\b|process\.stdin/i,
    68: /STDIN|fgets\s*\(/i,
    51: /ReadLine\s*\(/i
  };
  return patterns[parseInt(languageId, 10)]?.test(sourceCode) || false;
}

function hasBalancedDelimiters(sourceCode) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const opening = new Set(Object.values(pairs));
  const stack = [];
  for (const character of sourceCode) {
    if (opening.has(character)) stack.push(character);
    else if (pairs[character] && stack.pop() !== pairs[character]) return false;
  }
  return stack.length === 0;
}

const TIO_LANGUAGE_MAP = {
  50: 'c-gcc',          // C
  54: 'cpp-gcc',        // C++
  62: 'java-openjdk',   // Java
  71: 'python3',        // Python / DSA
  63: 'javascript-node',// JavaScript / Web Development
  68: 'php',            // PHP
  51: 'cs-core',        // C#
  82: 'sqlite',         // SQL
  
  'C': 'c-gcc',
  'C++': 'cpp-gcc',
  'Java': 'java-openjdk',
  'Python': 'python3',
  'JavaScript': 'javascript-node',
  'PHP': 'php',
  'C#': 'cs-core',
  'SQL': 'sqlite',
  'DSA': 'python3',
  'Web Development': 'javascript-node'
};

import { execFile } from 'child_process';
const execFileAsync = util.promisify(execFile);

async function getTioRunURL() {
  const { stdout: html } = await execFileAsync('curl.exe', ['-s', 'https://tio.run/']);
  const scriptUrl = html.match(/<script src="(\/static\/[a-f0-9]+-frontend\.js)"/)?.[1];
  if (!scriptUrl) {
    console.error('Failed to parse scriptUrl. HTML:', html.substring(0, 500));
    return null;
  }
  const { stdout: js } = await execFileAsync('curl.exe', ['-s', `https://tio.run${scriptUrl}`]);
  // The JS contains: var runURL = "/cgi-bin/static/1234567890abcdef...";
  const runURL = js.match(/var runURL = "\/cgi-bin\/static\/([^"]+)";/)?.[1];
  return runURL;
}

async function runTio(code, lang, inputStr) {
  const runURL = await getTioRunURL();
  if (!runURL) throw new Error('Cannot reach tio.run');
  
  const codeBuffer = Buffer.from(code, 'utf8');
  const inputBuffer = Buffer.from(inputStr || '', 'utf8');
  
  const payload = Buffer.concat([
    Buffer.from(`Vargs\x000\x00Vlang\x001\x00${lang}\x00VTIO_CFLAGS\x000\x00VTIO_OPTIONS\x000\x00F.code.tio\x00${codeBuffer.length}\x00`, 'utf8'),
    codeBuffer,
    Buffer.from(`F.input.tio\x00${inputBuffer.length}\x00`, 'utf8'),
    inputBuffer,
    Buffer.from(`R`, 'utf8')
  ]);
  
  const compressed = await deflateRaw(payload, { level: 9 });
  const randomHex = crypto.randomBytes(16).toString('hex');
  
  // Write the payload to a temporary file because passing binary via args is hard
  const os = await import('os');
  const path = await import('path');
  const tmpPath = path.join(os.tmpdir(), `tio_payload_${Date.now()}_${Math.random()}.bin`);
  const fs = await import('fs/promises');
  await fs.writeFile(tmpPath, compressed);
  
  try {
    const { stdout, stderr } = await execFileAsync('curl.exe', [
      '-s',
      '-X', 'POST',
      '--data-binary', `@${tmpPath}`,
      `https://tio.run/cgi-bin/static/${runURL}/${randomHex}`
    ], { encoding: 'buffer', maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  } finally {
    await fs.unlink(tmpPath).catch(() => {});
  }
}

router.post('/', async (req, res) => {
  try {
    const { sourceCode, languageId, stdin = '', questionId, assessmentId, questionIndex } = req.body;

    if (!sourceCode || !sourceCode.trim()) {
      return res.status(400).json({ error: 'Source code is required' });
    }
    if (!hasBalancedDelimiters(sourceCode)) {
      return res.json({
        stdout: '',
        stderr: '',
        compile_output: 'Compilation Error: Unbalanced brackets or parentheses in source code.',
        status: { id: 6, description: 'Compilation Error' },
        allPassed: false
      });
    }

    const langIdNum = parseInt(languageId, 10);
    const tioLang = TIO_LANGUAGE_MAP[langIdNum] || TIO_LANGUAGE_MAP[languageId] || 'python3';

const gunzip = util.promisify(zlib.gunzip);

    // Helper single execution using custom TIO
    const executeOnce = async (inputStr) => {
      try {
        let rawOutput = await runTio(sourceCode, tioLang, inputStr);
        try {
          rawOutput = await gunzip(rawOutput);
        } catch (e) {
          // If it fails to gunzip, try inflateRaw
          try {
             const inflateRaw = util.promisify(zlib.inflateRaw);
             rawOutput = await inflateRaw(rawOutput);
          } catch(err2) {
             console.error("Decompress failed:", err2.message, rawOutput.toString('utf8'));
          }
        }
        // TIO output format: random_16_bytes output random_16_bytes
        const rawStr = rawOutput.toString('utf8');
        const token = rawStr.substring(0, 16);
        const parts = rawStr.substring(16).split(token);
        const mainOutput = parts[0] || '';
        const debugOutput = parts[1] || ''; // contains exit code etc.
        
        let stdout = '';
        let stderr = '';
        let compile_output = '';
        let exitCode = 0;
        
        const debugLines = debugOutput.trim().split('\n');
        // last line contains exit code, like "Exit code: 1"
        const exitLine = debugLines[debugLines.length - 1] || '';
        if (exitLine.includes('Exit code: ')) {
           exitCode = parseInt(exitLine.replace('Exit code: ', '').trim(), 10) || 0;
        }

        if (exitCode !== 0) {
          const looksLikeCompilationError = /syntaxerror|compile|compilation|fatal error|cannot find symbol|parse error|expected .+ before/i.test(mainOutput);
          if (looksLikeCompilationError) {
            compile_output = mainOutput;
          } else {
            stderr = mainOutput;
          }
        } else {
          stdout = mainOutput;
        }
        
        return {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          compile_output: compile_output.trim(),
          status: { 
            id: exitCode === 0 ? 3 : 6, 
            description: exitCode === 0 ? 'Accepted' : 'Runtime Error' 
          }
        };
      } catch (err) {
        console.error(err);
        return { exitCode: 1, stderr: err.message || 'Execution error', status: { id: 6, description: 'Error' } };
      }
    };

    // Only the server may select evaluation cases. Custom execution remains a
    // single-run preview and cannot produce an assessment result.
    let testCases = [];
    let selectedQuestion = null;
    if (questionId) {
      selectedQuestion = await Question.findOne({ _id: questionId, isActive: true }).select('+testCases skill');
      if (!selectedQuestion) return res.status(404).json({ error: 'Question not found' });
      testCases = selectedQuestion.testCases || [];
      if (!readsStandardInput(sourceCode, languageId, selectedQuestion.skill)) {
        return res.json({
          stdout: '',
          stderr: 'WRONG ANSWER\n\nThe submitted program must read and process standard input.',
          compile_output: '',
          status: { id: 4, description: 'Wrong Answer' },
          testCasesPassed: 0,
          testCasesTotal: testCases.length,
          allPassed: false
        });
      }
    }

    // If server-selected test cases exist, run and evaluate each.
    if (testCases && testCases.length > 0) {
      let passedCount = 0;
      const results = [];
      let firstError = null;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const runRes = await executeOnce(tc.input);

        if (runRes.compile_output) {
          return res.json({
            stdout: '',
            stderr: '',
            compile_output: runRes.compile_output,
            status: { id: 6, description: 'Compilation Error' },
            allPassed: false
          });
        }

        if (runRes.stderr) {
          return res.json({
            stdout: runRes.stdout || '',
            stderr: runRes.stderr,
            compile_output: '',
            status: { id: 6, description: 'Runtime Error' },
            allPassed: false
          });
        }

        const received = (runRes.stdout || '').trim().replace(/\r\n/g, '\n');
        const expected = (tc.expectedOutput || '').trim().replace(/\r\n/g, '\n');

        // Robust equality check
        const isMatch = received === expected || (
          !isNaN(Number(received)) && !isNaN(Number(expected)) && Number(received) === Number(expected)
        );

        if (isMatch) {
          passedCount++;
          results.push({ testCase: i + 1, passed: true, isHidden: tc.isHidden });
        } else {
          results.push({
            testCase: i + 1,
            passed: false,
            ...(tc.isHidden ? {} : { expected, received }),
            isHidden: tc.isHidden
          });
          if (!firstError) {
            firstError = { expected: tc.isHidden ? null : expected, received: tc.isHidden ? null : received, testCase: i + 1, isHidden: tc.isHidden };
          }
        }
      }

      const allPassed = passedCount === testCases.length;
      const response = {
        stdout: results.map(r => r.passed ? `✓ Test Case ${r.testCase} Passed` : `✗ Test Case ${r.testCase} Failed`).join('\n') + (allPassed ? '\n\n✓ ALL TEST CASES PASSED' : ''),
        stderr: firstError ? (firstError.isHidden
          ? `WRONG ANSWER\n\nA hidden test case failed.`
          : `WRONG ANSWER\n\nExpected Output:\n${firstError.expected}\n\nReceived Output:\n${firstError.received || '(No output produced)'}`) : '',
        compile_output: '',
        status: { id: allPassed ? 3 : 4, description: allPassed ? 'Accepted' : 'Wrong Answer' },
        testCasesPassed: passedCount,
        testCasesTotal: testCases.length,
        allPassed,
        details: results
      };

      if (questionId && assessmentId && Number.isInteger(questionIndex)) {
        const assessment = await Assessment.findOne({ _id: assessmentId, status: { $ne: 'completed' } });
        const responseQuestion = assessment?.questions?.[questionIndex];
        if (assessment && responseQuestion && responseQuestion.questionId.toString() === questionId) {
          responseQuestion.status = 'submitted';
          responseQuestion.result = allPassed ? 'correct' : 'wrong';
          responseQuestion.testCasesPassed = passedCount;
          responseQuestion.testCasesTotal = testCases.length;
          responseQuestion.output = response.stdout;
          responseQuestion.attempts = (responseQuestion.attempts || 0) + 1;
          assessment.markModified('questions');
          await assessment.save();
        }
      }

      return res.json(response);
    }

    // Single run execution
    const singleRes = await executeOnce(stdin);
    res.json(singleRes);

  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ error: 'Code execution service encountered an error' });
  }
});

// For backward compatibility if other modules import it
export const LANGUAGE_MAP = {
  'C': 50, 'C++': 54, 'Java': 62, 'Python': 71, 'JavaScript': 63, 'PHP': 68, 'C#': 51, 'SQL': 82, 'DSA': 71, 'Web Development': 63
};
export default router;
