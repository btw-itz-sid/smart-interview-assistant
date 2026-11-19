const test = require('node:test');
const assert = require('node:assert/strict');

const { extractJson, extractQuestionList } = require('../dist/utils/parseAiJson');

test('extractJson unwraps markdown fences', () => {
  const parsed = extractJson('```json\n{"score": 8, "evaluation": "Strong"}\n```');
  assert.equal(parsed.score, 8);
  assert.equal(parsed.evaluation, 'Strong');
});

test('extractJson recovers JSON buried in prose', () => {
  const parsed = extractJson('Here you go:\n{"questions":["Q1","Q2"]}\nThanks');
  assert.deepEqual(parsed.questions, ['Q1', 'Q2']);
});

test('extractQuestionList accepts both array and object payloads', () => {
  assert.deepEqual(extractQuestionList('["One","Two","Three"]', 2), ['One', 'Two']);
  assert.deepEqual(
    extractQuestionList('{"questions":[{"question":"A"},{"question":"B"}]}', 5),
    ['A', 'B']
  );
});
