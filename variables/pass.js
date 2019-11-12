const assert = require('assert');
const report = [];

const arr2 = [[1, [2]], [3, [4]], 5];
const vanilla2 = arr2.reduce((a, b) => a.concat(b), []);


try {
  report.push(['it should do another thing']);
  assert.deepStrictEqual([1, [2], 3, [4], 5], vanilla2);
} catch (assertionErr) { report.slice(-1)[0].push(assertionErr) };


if (module.parent === null) {
  console.log(report);
} else {
  module.exports = report;
}
