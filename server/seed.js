import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import Question from './models/Question.js';
import Student from './models/Student.js';
import Assessment from './models/Assessment.js';

const PROGRAMMING_SKILLS = [
  'Python', 'Java', 'C++', 'C', 'JavaScript', 'DSA', 'PHP', 'C#'
];

const SQL_QUESTIONS = [
  ['Select all rows from a students table', 'SELECT * FROM students;', '*'],
  ['Select the name column from students', 'SELECT name FROM students;', 'name'],
  ['Select students whose age is greater than 18', 'SELECT * FROM students WHERE age > 18;', 'filtered rows'],
  ['Sort students by name', 'SELECT * FROM students ORDER BY name;', 'sorted rows'],
  ['Count the rows in a students table', 'SELECT COUNT(*) FROM students;', 'count'],
  ['Find the maximum age', 'SELECT MAX(age) FROM students;', 'maximum age'],
  ['Find the minimum age', 'SELECT MIN(age) FROM students;', 'minimum age'],
  ['Find the average age', 'SELECT AVG(age) FROM students;', 'average age'],
  ['Find the total of a marks column', 'SELECT SUM(marks) FROM students;', 'total marks'],
  ['Select unique department values', 'SELECT DISTINCT department FROM students;', 'unique departments'],
  ['Insert a student row', "INSERT INTO students (name, age) VALUES ('Alex', 20);", 'row inserted'],
  ['Update a student age', "UPDATE students SET age = 21 WHERE name = 'Alex';", 'row updated'],
  ['Delete a student by name', "DELETE FROM students WHERE name = 'Alex';", 'row deleted'],
  ['Select names beginning with A', "SELECT name FROM students WHERE name LIKE 'A%';", 'matching names'],
  ['Select ages between 18 and 25', 'SELECT * FROM students WHERE age BETWEEN 18 AND 25;', 'matching rows'],
  ['Group students by department', 'SELECT department, COUNT(*) FROM students GROUP BY department;', 'group counts'],
  ['Use an alias for the name column', 'SELECT name AS student_name FROM students;', 'student_name'],
  ['Select rows with a non-null email', 'SELECT * FROM students WHERE email IS NOT NULL;', 'non-null rows'],
  ['Join students with departments', 'SELECT students.name, departments.title FROM students JOIN departments ON students.department_id = departments.id;', 'joined rows'],
  ['Return the first five students', 'SELECT * FROM students LIMIT 5;', 'first five rows']
];

function parsePdfQuestions(text) {
  const normalized = text
    .replace(/-- \d+ of 18 --/g, '')
    .replace(/Page \d+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const questionPattern = /Q(\d+)\.\s*(.*?)\s*\[Easy\]\s*Input:\s*(.*?)\s*Output:\s*(.*?)(?=Q\d+\.|$)/g;
  return [...normalized.matchAll(questionPattern)].map((match) => ({
    number: Number(match[1]),
    title: match[2].trim(),
    input: match[3].trim(),
    output: match[4].trim()
  }));
}

async function getPdfProgrammingQuestions() {
  const pdfPath = new URL('./data/200_Simple_Programming_Questions.pdf', import.meta.url);
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  try {
    const { text } = await parser.getText();
    const questions = parsePdfQuestions(text);
    if (questions.length !== 200) {
      throw new Error(`Expected 200 PDF questions, found ${questions.length}`);
    }
    return questions;
  } finally {
    await parser.destroy();
  }
}

function toProgrammingRecord(question, skill) {
  return {
    title: `Q${question.number}. ${question.title}`,
    description: question.title,
    skill,
    concept: 'Beginner Programming',
    difficulty: 'Easy',
    sampleInput: question.input,
    sampleOutput: question.output,
    marks: 5,
    expectedTime: 3,
    testCases: [{ input: question.input, expectedOutput: question.output, isHidden: false }]
  };
}

function getSqlRecords() {
  return SQL_QUESTIONS.map(([title, query, output]) => ({
    title: `SQL: ${title}`,
    description: `Write the SQL query: ${title}.`,
    skill: 'SQL',
    concept: 'SQL',
    difficulty: 'Easy',
    sampleInput: '',
    sampleOutput: output,
    marks: 5,
    expectedTime: 3,
    boilerplateCode: `-- ${title}\n${query}`,
    testCases: [{ input: '', expectedOutput: output, isHidden: false }]
  }));
}

function getWebRecord() {
  return {
    title: 'Create a website using HTML and CSS',
    description: 'Create a website using HTML and CSS',
    skill: 'Web Development',
    concept: 'HTML and CSS',
    difficulty: 'Easy',
    sampleInput: '',
    sampleOutput: 'A working HTML and CSS website',
    marks: 5,
    expectedTime: 10,
    boilerplateCode: '<!doctype html>\n<html>\n  <head>\n    <style>\n      /* Write your CSS here */\n    </style>\n  </head>\n  <body>\n    <!-- Build your website here -->\n  </body>\n</html>',
    testCases: []
  };
}

export async function seedQuestions() {
  const pdfQuestions = await getPdfProgrammingQuestions();
  const programmingRecords = PROGRAMMING_SKILLS.flatMap((skill) =>
    pdfQuestions.map((question) => toProgrammingRecord(question, skill))
  );
  const allQuestions = [...programmingRecords, ...getSqlRecords(), getWebRecord()];

  await Question.bulkWrite(allQuestions.map((question) => ({
    updateOne: {
      filter: { title: question.title, skill: question.skill },
      update: { $setOnInsert: question },
      upsert: true
    }
  })));
  console.log(`[Seed] Loaded ${pdfQuestions.length} PDF questions across ${PROGRAMMING_SKILLS.length} programming skills, ${SQL_QUESTIONS.length} SQL questions, and 1 web question.`);
}

export async function seedStudents() {
  console.log('[Seed] Student seeding is disabled. Real registrations are stored only when students register through the app.');
  return 0;
}
