/* what to do about
  files that are deleted but still have reports
    entries can be filtered at load?
    or whatever
    or go back to rewriting the whole report every time?
      nice - can still preserve evaluation times

*/

const fs = require('fs');
const path = require('path');
const tableOfContents = require('./table-of-contents.js');

const toLog = process.argv.length > 2
  ? process.argv
  : Object.keys(tableOfContents)

console.log('\ngenerating reports ...\n');


const oldRepoReport = (() => {
  try {
    const rawOldReport = fs.readFileSync('./report.json');
    const parsedOldReport = JSON.parse(rawOldReport);
    if (parsedOldReport.warnings['unable to load previous report']) {
      delete parsedOldReport.warnings['unable to load previous report'];
    }
    return parsedOldReport
  } catch (err) {
    return {
      warnings: {
        'unable to load previous report': err.message
      },
    };
  };
})();

const newRepoReport = Object.assign({}, oldRepoReport, {
  repoName: 'js-in-node',
  status: 'unknown',
  directories: []
});

toLog.forEach(key => {
  if (key in tableOfContents) {

    const directory = key;
    const logsPath = '/' + directory + '/*.js';
    console.log(logsPath + '\n');

    const oldDirectoryReport = (() => {
      try {
        const rawOldReport = fs.readFileSync('./' + directory + '/report.json');
        const parsedOldReport = JSON.parse(rawOldReport);
        if (parsedOldReport.warnings['unable to load previous report']) {
          delete parsedOldReport.warnings['unable to load previous report'];
        }
        return parsedOldReport
      } catch (err) {
        return {
          warnings: {
            'unable to load previous report': err.message
          },
        };
      };
    })();

    const newDirectoryReport = Object.assign({}, oldDirectoryReport, {
      dirName: directory,
      status: 'unknown',
      files: []
    });

    fs.readdirSync(directory)
      .filter(function (file) {
        return path.extname(file) === '.js';
      })
      .filter(function (file) {
        const evaluateFile = tableOfContents[directory].indexOf(file) !== -1;
        if (!evaluateFile) {
          const newFileReport = { fileName: file, status: 'on hold' };
          const oldFileIndex = oldDirectoryReport.findIndex(x => x.fileName === file);
          const oldTimestamp = oldDirectoryReport[oldFileIndex].hasOwnProperty('evaluated');
          if (oldFileIndex !== -1 && oldTimestamp) {
            newFileReport.evaluated = oldDirectoryReport[oldFileIndex].evaluated;
          }
          newDirectoryReport.push(newFileReport)
        }
        return evaluateFile;
      })
      .forEach(function (file) {

        const oldFileIndex = oldDirectoryReport.directories instanceof Array
          && oldDirectoryReport.directories.findIndex(x => x.fileName === file);
        const oldFileReport = oldFileIndex === -1
          ? {}
          : oldDirectoryReport[oldFileIndex]

        const newFileReport = { fileName: file, status: 'unknown' };

        const evaluation = (() => {
          try {
            return require('./' + directory + '/' + file);
          } catch (err) {
            return err;
          }
        })();

        if (evaluation instanceof Error) {
          newFileReport.status = 'error';
          newFileReport.error = {
            message: evaluation.message,
          };
          evaluation.hasOwnProperty('type')
            ? newFileReport.error.type = report.type : null;
          evaluation.hasOwnProperty('arguments')
            ? newFileReport.error.arguments = report.arguments : null;

        } else {
          newFileReport.status = (() => {
            if (evaluation instanceof Array) {
              return evaluation.length === 0
                ? 'no reports'
                : evaluation.every(x => x.length === 1)
                  ? 'passing'
                  : 'in progress';
            } else {
              return 'invalid';
            }
          })();
          newFileReport.report = (() => {
            if (evaluation instanceof Array) {
              return evaluation.map(entry => {
                if (entry instanceof Array) {
                  if (entry.length === 1) {
                    return '✔ ' + String(entry[0])
                  } else {
                    const secondItemParsed = (() => {
                      try {
                        const restOfEntry = entry.slice(1, entry.length);
                        const restParsed = restOfEntry.map(x => {
                          if (x instanceof Error) {
                            if (x.name === 'AssertionError') {
                              const errorLog = {};
                              x.hasOwnProperty('operator') ? errorLog.operator = x.operator : null;
                              x.hasOwnProperty('actual') ? errorLog.actual = x.actual : null;
                              x.hasOwnProperty('expected') ? errorLog.expected = x.expected : null;
                              // x.hasOwnProperty('name') ? errorLog.name = x.name : null;
                              return errorLog;
                            } else {
                              fileReport.error = {
                                message: evaluation.message,
                              };
                              evaluation.hasOwnProperty('type') ? fileReport.error.type = evaluation.type : null;
                              evaluation.hasOwnProperty('arguments') ? fileReport.error.arguments = evaluation.arguments : null;
                              return errorLog;
                            }
                          } else {
                            return typeof x === 'function'
                              ? x.toString()
                              : x
                          }
                        });
                        if (restParsed instanceof Array && restParsed.length === 1) {
                          return restParsed[0];
                        } else {
                          return restParsed;
                        }
                      } catch (err) {
                        return x;
                      }
                    })();
                    return { ['✗ ' + String(entry[0])]: secondItemParsed };
                  }
                } else {
                  return typeof x === 'function'
                    ? x.toString()
                    : x;
                }
              })
            } else {
              return {
                invalidReport: evaluation,
                expectedType: 'Array',
                actualType: typeof evaluation,
              };
            }
          })();
        }
        console.log(file, newFileReport)
        newFileReport.evaluated = (new Date()).toLocaleString();

        newDirectoryReport.files.push(newFileReport);

      });

    /*
      - error
      - in progress
      passing
      - on hold
      - no reports
    */

    newDirectoryReport.status = (() => {
      if (!newDirectoryReport.files.every(file => file.status !== 'error')) {
        return 'error';
      } else if (newDirectoryReport.files.every(file => file.status === 'no reports')) {
        return 'no reports';
      } else if (newDirectoryReport.files.every(file => file.status === 'passing')) {
        return 'passing';
      } else if (newDirectoryReport.files.every(file => file.status === 'on hold')) {
        return 'on hold';
      } else if (!newDirectoryReport.files.every(file => file.status !== 'in progress')) {
        return 'in progress';
      }
    })();

    fs.writeFileSync('./' + directory + '/report.json', JSON.stringify(newDirectoryReport, null, 2));

    const slimDirectoryReport = {
      dirName: newDirectoryReport.dirName,
      status: newDirectoryReport.status,
      files: newDirectoryReport.files
        .map(file => ({ [file.fileName]: file.status }))
        .reduce((acc, fileSlim) => Object.assign(acc, fileSlim), {})
    };

    newRepoReport.directories.push(slimDirectoryReport)
  }

})


newRepoReport.status = (() => {
  if (!newRepoReport.directories.every(directory => directory.status !== 'error')) {
    return 'error';
  } else if (newRepoReport.directories.every(directory => directory.status === 'no reports')) {
    return 'no reports';
  } else if (newRepoReport.directories.every(directory => directory.status === 'passing')) {
    return 'passing';
  } else if (newRepoReport.directories.every(directory => directory.status === 'on hold')) {
    return 'on hold';
  } else if (!newRepoReport.directories.every(directory => directory.status !== 'in progress')) {
    return 'in progress';
  }
})();
fs.writeFileSync('./report.json', JSON.stringify(newRepoReport, null, 2));


console.log('... all done!\n');




// https://stackoverflow.com/questions/32719923/redirecting-stdout-to-file-nodejs
