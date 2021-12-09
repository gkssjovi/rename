#!/usr/bin/env node

const fs = require('fs');
const path = require("path");
const os = require("os");
const parsePath = require('parse-filepath');
const { debug, escapeRegex, formatName } = require("./helpers");
const { colorize, Colors } = require("./colors");
const inquirer = require("inquirer");
const options = require("./options");

const main = async () => {
    const match = options._[0] || '.*';
    const pwd = process.cwd();
    const input = fs.readdirSync(pwd).filter(name => {
        const lstat = fs.lstatSync(path.join(pwd, name));
        return lstat.isFile() && (new RegExp(match, 'gim')).test(name);
    });
    
    const format = options.format;
    if (!/%d/.test(format)) {
        console.log(colorize(`Invalid format ${format}. The %d character is missing.`, Colors.FgRed));
        process.exit(1);
    }
    
    const output = [];
    for (let index = 0; index < input.length; index++) {
        const file = input[index];
        const filePath = path.join(pwd, file);
        const filePathinfo = parsePath(filePath);
    
        
        const rename = `${formatName(index + 1, format)}`;

        const renamePath = path.join(pwd, `${rename}${filePathinfo.ext}`);
        output.push({
            file: {
                exists: fs.existsSync(filePath),
                path: filePath,
                pathinfo: filePathinfo,
            },
            rename: {
                exists: fs.existsSync(renamePath),
                name: rename,
                path: renamePath,
                pathinfo: parsePath(renamePath),
            },
        });
    }
    
    const filesNotExits = output.filter(item => !item.file.exists).map(item => item.file.path);
    if (filesNotExits.length > 0)  {
        console.log(`The files does not exists:`);
        filesNotExits.forEach(file => console.log(file));
    }

    const filesWillRename = output.filter(item => item.file.exists && !item.rename.exists).map(item => [
        item.file.path,
        item.rename.path,
    ]);
    
    let index = 1;
    if (filesWillRename.length > 0) {
        index = Number(parsePath(filesWillRename[filesWillRename.length -1][1]).name);
    }
    
    const filesThatExists = output.filter(item => item.file.exists && item.rename.exists).map((item, i) => [
        item.file.path,
        formatName(`${String(index + i)}${item.file.pathinfo.ext}`, format),
    ]);
    
    const files = filesWillRename.concat(filesThatExists);
    
    const size = new Array(files.length).fill(0)
    for (let index = 0; index < files.length; index++) {
        const [oldFile, newFile] = files[index];
        const [oldInfo, newInfo] = [parsePath(oldFile), parsePath(newFile)];
        
        if (oldInfo.basename.length > size[index]) {
            size[index] = oldInfo.basename.length;
        }

    }
    
    const maxSize = Math.max(...size);
    for (let index = 0; index < files.length; index++) {
        const [oldFile, newFile] = files[index];
        const [oldInfo, newInfo] = [parsePath(oldFile), parsePath(newFile)];
        console.log(`${colorize(oldInfo.basename, Colors.FgRed)}${' '.repeat(maxSize - oldInfo.basename.length)} ➜ ${colorize(newInfo.basename, Colors.FgGreen)}`);
    }
    
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'value',
            default: false,
            message: `Are you sure you want to rename those files:`,
        } 
     ]).then(({ value }) => {
         if (value) {
            for (let index = 0; index < files.length; index++) {
                const [oldFile, newFile] = files[index];
                const [oldInfo, newInfo] = [parsePath(oldFile), parsePath(newFile)];
                fs.rename(oldFile, newFile, (err) => {
                    if (err) {
                        console.log(colorize(`${path.join(newInfo.basename)}`, Colors.FgRed));
                        return ;
                    }
                    
                    console.log(colorize(`${path.join(newInfo.basename)}`, Colors.FgGreen));
                });
            }
         }
     });
}

main()