const parse = require('parse-gitignore');
const fs = require('fs');

const updateGitIgnore = function() {
  let ignoreFiles = parse(fs.readFileSync('./../packages/gtmcore/gtmcore/labbook/gitignore.default'));
  let filePath = './src/js/data/gitignore.json'
  let fileContent = JSON.stringify({ gitIgnore: ignoreFiles });

  fs.exists(filePath, function(exists) {
    console.log(exists)
    if (exists) {
      //open existing file
      fs.open(filePath, 'w', (err, fd) => {

        if (err) throw err;
        // write to the file
        fs.write(fd, fileContent, 0, fileContent.length, function(err) {
            if (err) throw 'error writing file: ' + err;
            // close file
            fs.close(fd, function() {
                console.log(`${fd} updated`);
            })
        });
      });
    } else {

      // create new files
      fs.writeFile(filePath, fileContent, { flag: 'wx' }, (err) => {
        console.log(err)
      })
    }
  });
}

module.exports = {
  updateGitIgnore: updateGitIgnore,
};
