const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculateInterviewScore,
  calculateImprovement,
  calculateWeightedAverage,
  classifyTopics,
  getScoreGrade,
  scoreToPercentage,
} = require('../dist/utils/scoreCalculator');

const {
  atsScoreSchema,
  behavioralInterviewSchema,
  companyInterviewSchema,
  generateQuestionSchema,
  jdInterviewSchema,
  resumeAnalyzeSchema,
} = require('../dist/models/validation');

test('score utilities calculate expected values', () => {
  assert.equal(calculateInterviewScore([8, 9, null, 7]), 8);
  assert.equal(scoreToPercentage(8), 80);
  assert.equal(getScoreGrade(9), 'A+');
  assert.equal(getScoreGrade(6), 'B');
  assert.equal(calculateWeightedAverage([]), 0);
  assert.equal(calculateWeightedAverage([5, 10]) > 7.5, true);
});

test('topic classification groups scores by strength', () => {
  const result = classifyTopics([
    { topic: 'React', avgScore: 8 },
    { topic: 'Node.js', avgScore: 6 },
    { topic: 'System Design', avgScore: 4 },
  ]);

  assert.deepEqual(result.strong, ['React']);
  assert.deepEqual(result.average, ['Node.js']);
  assert.deepEqual(result.weak, ['System Design']);
});

test('improvement utility handles normal and zero baselines', () => {
  assert.deepEqual(calculateImprovement(5, 7), {
    diff: 2,
    percentage: '40%',
    improved: true,
  });

  assert.deepEqual(calculateImprovement(0, 4), {
    diff: 4,
    percentage: '100%',
    improved: true,
  });
});

test('interview validation applies defaults and rejects bad counts', () => {
  const parsed = generateQuestionSchema.parse({ topic: 'React' });
  assert.equal(parsed.difficulty, 'medium');
  assert.equal(parsed.count, 3);

  assert.equal(generateQuestionSchema.safeParse({ topic: 'R', count: 3 }).success, false);
  assert.equal(generateQuestionSchema.safeParse({ topic: 'React', count: 20 }).success, false);
});

test('specialized interview schemas validate deployment API contracts', () => {
  assert.equal(
    companyInterviewSchema.parse({ company: 'Google', role: 'SDE' }).count,
    5
  );

  assert.equal(
    behavioralInterviewSchema.parse({}).focusArea,
    'general'
  );

  assert.equal(
    jdInterviewSchema.safeParse({ jobDescription: 'too short' }).success,
    false
  );
});

test('resume validation enforces meaningful minimum content', () => {
  assert.equal(resumeAnalyzeSchema.safeParse({ resumeText: 'short' }).success, false);
  assert.equal(atsScoreSchema.safeParse({ resumeText: 'short' }).success, false);

  const resumeText = 'Software engineer with experience in React, Node.js, APIs, testing, PostgreSQL, and cloud deployment.';
  assert.equal(atsScoreSchema.safeParse({ resumeText }).success, true);
});
