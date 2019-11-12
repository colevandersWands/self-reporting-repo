const assert = require('assert');

function shuffle(a, b, c) {
  // write me!
}

const testCases = [
  { name: 'first', args: ['y', 'x', 'z'], expected: 'zyx' },
  { name: 'second', args: ['z', 'x', 'y'], expected: 'yzx' },
  { name: 'third', args: ['y', 'z', 'x'], expected: 'xyz' },
  { name: 'fourth', args: ['x', 'y', 'z'], expected: 'zxy' },
];

const report = [];
testCases.forEach(testCase => {
  try {
    assert.deepEqual(
      shuffle(...testCase.args),
      testCase.expected
    )
    report.push(testCase.name);
  } catch (err) {
    report.push(err);
  }
});

if (module.parent === null) {
  console.log(report);
} else {
  module.exports = report;
}
