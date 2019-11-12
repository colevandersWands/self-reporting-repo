const assert = require('assert');

function caesarize(str, shiftNum) {
  // write me!
}

const testCases = [
  { name: 'first', args: ["aBcD", 3], expected: 'dEfG' },
  { name: 'second', args: ["aBcD", -3], expected: 'xYzA' },
  { name: 'third', args: ["heLLo worLd!", 0], expected: 'heLLo worLd!' },
  { name: 'fourth', args: ["heLLo worLd!", 1], expected: 'ifMMp xpsMe!' },
  { name: 'fifth', args: ["", 5], expected: '' },
  { name: 'sixth', args: ["mnOpQr", 26], expected: 'mnOpQr' },
  { name: 'seventh', args: ["#@&&^F*(#", 7], expected: '#@&&^M*(#' },
];

const report = [];
testCases.forEach(testCase => {
  try {
    assert.deepEqual(
      caesarize(...testCase.args),
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
