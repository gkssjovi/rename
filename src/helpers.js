
const { inspect } = require("util");
const child_process = require('child_process');
const { spawn } = child_process;
const util = require('util');
const exec = util.promisify(child_process.exec);

const call = async (command, args, silent = false) => {
    const data = [];
    const child = spawn(command, args);
    
    for await (const line of child.stdout) {
        if (!silent) {
            process.stdout.write(line)
        }
        data.push(line.toString());
    }

    return data.join('');
};

const debug = (str) => {
    console.log(inspect(str, false, 10, true));
}

const escapeRegex = (string) => {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const formatName = (str, format) => {
    return String(format).replace(/%d/, String(str));
};

module.exports = {
    call,
    spawn,
    debug,
    escapeRegex,
    formatName,
};