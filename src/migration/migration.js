const config = require('config');
const fs = require('fs');
const exec = require('child_process').exec;
const version = require('../../package.json').version;

const name = `migration-V${version}`;

const ormConfig = config.get('typeOrm');
if(fs.existsSync('./src/migration/ormConfig.json')){
    fs.unlinkSync('./src/migration/ormConfig.json');
}
fs.writeFileSync('./src/migration/ormConfig.json',JSON.stringify(ormConfig));
exec(`npm run typeorm -- migration:generate -f ./src/migration/ormConfig.json -n ${name}`,
(err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    } else {
     // the *entire* stdout and stderr (buffered)
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
    }
})