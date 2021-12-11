#!/usr/bin/env node

const fs = require('fs');
const path = require("path");
const os = require("os");
const parsePath = require('parse-filepath');
const { debug, escapeRegex, formatName, matchRule } = require("./helpers");
const { colorize, Colors } = require("./colors");
const inquirer = require("inquirer");
const options = require("./options");

const main = async () => {
    const match = options._[0] || '*';
    const pwd = process.cwd();
    const input = fs.readdirSync(pwd).filter(name => {
        const lstat = fs.lstatSync(path.join(pwd, name));
        // return lstat.isFile() && (new RegExp(match, 'gim')).test(name);
        return lstat.isFile() && matchRule(name, match);
    }).sort((a, b) => {
        const ai = parseInt(a);
        const bi = parseInt(b);
        if (ai < bi) {
            return -1
        }
        if (ai > bi) {
            return 1;
        }
        return 0;
    });
    
    const format = options.format;
    if (!/%d/.test(format)) {
        console.log(colorize(`Invalid format ${format}. The %d character is missing.`, Colors.FgRed));
        process.exit(1);
    }
    
    const names = [];
    const namesList = [];
    for (let index = 0; index < input.length; index++) {
        const file = input[index];
        const idx = index + 1;
        const rename = {
           value: `${formatName(idx, format)}`,
           index: idx,
           exists: false,
        };
        
        names.push(rename)
        namesList.push(rename.value);
    }
    
    for (let index = 0; index < input.length; index++) {
        const file = input[index];
        const info = parsePath(file);
        const nameIndex = namesList.indexOf(info.name);
        if (nameIndex > -1) {
            names[nameIndex].exists = true;
        }
    }
    
    const uniquieNames = names.filter(item => item.exists == false);
    const files = input.filter(item => namesList.indexOf(parsePath(item).name) == -1);
    
    const renameList = [];
    for (let index = 0; index < files.length; index++) {
        const oldName = files[index];
        const info = parsePath(oldName);
        const rename = uniquieNames.shift();
        const newName = `${rename.value}${info.ext}`;
        renameList.push([oldName, newName])
    }
    
    const size = new Array(renameList.length).fill(0)
    for (let index = 0; index < renameList.length; index++) {
        const [oldFile, newFile] = renameList[index];
        const [oldInfo, newInfo] = [parsePath(oldFile), parsePath(newFile)];
        
        if (oldInfo.basename.length > size[index]) {
            size[index] = oldInfo.basename.length;
        }
    }
    
    const maxSize = Math.max(...size);
    for (let index = 0; index < renameList.length; index++) {
        const [oldFile, newFile] = renameList[index];
        const [oldInfo, newInfo] = [parsePath(oldFile), parsePath(newFile)];
        console.log(`${colorize(oldInfo.basename, Colors.FgRed)}${' '.repeat(maxSize - oldInfo.basename.length)} ➜ ${colorize(newInfo.basename, Colors.FgGreen)}`);
    }
    
    
    if (renameList.length > 0) {
        inquirer.prompt([
            {
                type: 'confirm',
                name: 'value',
                default: false,
                message: `Are you sure you want to rename those files:`,
            } 
         ]).then(({ value }) => {
             if (value) {
                for (let index = 0; index < renameList.length; index++) {
                    const [oldFile, newFile] = renameList[index];
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
    } else {
        console.log(colorize('No files to rename.', Colors.FgYellow));
    }
}

main()