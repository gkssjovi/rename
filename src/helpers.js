
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
    const zeros = (format.match(/0/g) || []).length;
    str = String(str);
    
    const mult = (zeros - str.length) + 1;
    
    if (mult > 0) {
        const zerosPrint = '0'.repeat(mult);
        return String(format).replace(/0+/, zerosPrint).replace(/%d/, str);
    }
    return str;

};

const formatNameRegex = (string) => {
    return String(format).replace(/%d/, String(str));
};

const matchRule = (str, rule) => {
  var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

module.exports = {
    call,
    spawn,
    debug,
    escapeRegex,
    formatName,
    matchRule,
};