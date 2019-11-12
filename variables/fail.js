const assert = require('assert');

const report = [];

const arr1 = [1, [2, [3, [4]], 5]];
const vanilla1 = arr1.reduce((a, b) => a.concat(b), []);

try {
  report.push(['it should do a thing']);
  assert.deepStrictEqual(false, true);
} catch (assertionErr) { report.slice(-1)[0].push(assertionErr) };


if (module.parent === null) {
  console.log(report);
} else {
  module.exports = report;
}
