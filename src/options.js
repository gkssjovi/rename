const yargs = require('yargs');
const options = yargs
    .command('<match>', 'Match wildcard expression')
    .option('format', {
        alias: 'f',
        describe: 'Output format',
        type: 'string',
        default: '00%d',
        demandOption: false,
    })
    .version('1.0')
    .argv;

module.exports = options;