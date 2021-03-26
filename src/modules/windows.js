//
// File:          windows.js
//
// Description:   This file contains all low level 
//                functions that would be OS dependent.  
//
// TODO: Currently just a copy of the macOS.js file.

const path = require('path');
const os = require('os');
const fs = require('fs');
const childProcess = require('child_process');

var windows = {
  dirFirst: true,
  sortFunction: null,
  filterFunction: null,
  terminalScript: "/Users/raguay/bin/openTerminal.scpt",
  init: function() {
    this.sortFunction = this.alphaSort;
    this.filterFunction = this.defaultFilter;
  },
  getDirFirst: function() {
    return dirFirst;
  },
  setDirFirst: function(flag) {
    if(typeof flag === 'boolean') {
      this.dirFirst = flag;
    }
  },
  setDirSort: function(sortFunction) {
    this.sortFunction = sortFunction;
  },
  setFilter: function(flt) {
    this.filterFunction = flt;
  },
  getTerminalScript: function() {
    return this.terminalScript;
  },
  setTerminalScript: function(scrpt) {
    this.terminalScript = scrpt;
  },
  getHomeDir: function() {
    return(os.homedir());
  },
  pathSep() {
    return(path.sep);
  },
  readDir: function(dir) {
    return fs.readdirSync(dir);
  },
  fileExists: function(file) {
    var result = true;
    try {
      fs.accessSync(file);
      result = true;
    } catch(e) {
      result = false;
    }
    return result;
  },
  moveEntries: function(from, to) {
    childProcess.execSync("mv '" + from + "' '" + to + "'");
  },
  copyEntries: function(from, to) {
    childProcess.execSync("cp -R '" + from + "' '" + to + "'");
  },
  deleteEntries: function(item) {
    childProcess.execSync("rm -R '" + item + "'");
  },
  getDirList: function(dir) {
    //
    // A directory list is provided giving an array of entry object. Each 
    // entry object has:
    //    name    The name of the file
    //    type    The type of the entry: a file - 0, a directory - 1, a link - 2
    //    fileSystem The file system object.
    //    dir     The directory of the file
    //    datetime  The creation datetime of the file
    //    size    The integer size of the file in 1kb (Directories and links have zero size)
    //    selected Boolean true is selected, false is not selected
    //
    var entries = [];
    var items = fs.readdirSync(dir);
    for (var i=0; i<items.length; i++) {
      if(typeof items[i] !== 'undefined') {
        var file = '';
        if(items[i][0] == path.sep) items[i] = items[i].slice(1);
        if((dir != path.sep)&&(dir.length > 1)) {
          file = dir + path.sep + items[i];
        } else {
          file = path.sep + items[i];
        }
        var newEntry;
        try {
          var stats = fs.statSync(file);
        } catch(e) {
          newEntry = {
            name: items[i],
            dir: dir,
            fileSystemType: "windows",
            fileSystem: this,
            selected: false,
            datetime: '',
            type: 0,
            size: 0
          };
        }
        newEntry = {
          name: items[i],
          dir: dir,
          fileSystemType: "windows",
          fileSystem: this,
          selected: false,
          datetime: stats.mtime.toLocaleString(),
          type: 0,
          size: 0
        };
        if(stats.isDirectory()) {
          //
          // It's a directory.
          //
          newEntry.type = 1;
          newEntry.size = 0;
        } else if(stats.isSymbolicLink()) {
          //
          // It's a link.
          //
          newEntry.type = 2;
          newEntry.size = stats['size'];
        } else {
          //
          // It's a file.
          //
          newEntry.type = 0;
          newEntry.size = stats['size'];
        }
        entries.push(newEntry);
      }
    }
    
    //
    // filter out the entries.
    //
    entries = entries.filter(this.filterFunction);
 
    //
    // Sort the entries.
    //
    if(this.dirFirst) {
      var dirEntries = entries.filter(item => item.type === 1);
      var fileEntries = entries.filter(item => item.type === 0);
      dirEntries.sort(this.sortFunction);
      fileEntries.sort(this.sortFunction);
      entries = [...dirEntries, ...fileEntries];
    } else {
      entries.sort(this.sortFunction);
    }

    //
    // Return the result.
    //
    return(entries);
  },
  defaultFilter: function(item) { 
    return item.name[0] !== '.';
  },
  alphaSort: function(item1, item2) {
    const a = item1.name.toLowerCase();
    const b = item2.name.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
  },
  openFile: function(dir, file) {
    //
    // For macOS, open with the open command line command.
    //
    childProcess.execSync("/usr/bin/open '" + this.appendPath(dir, file) + "'");
  },
  openFileWithProgram: function(prog,file) {
    //
    // For macOS, open with the open command line command.
    //
    childProcess.exec("/usr/bin/open -a '" + prog + "' '" + file + "'", (err, stdin, stdout) => {});
  },
  openInTerminal: function(prog, file) {
    childProcess.exec("/usr/bin/osascript " + this.terminalScript + " '" + prog + " \"" + file + "\"'", (err, stdin, stdout) => {});
  },
  runCommandLine: function(line) {
    childProcess.exec(line, (err, stdin, stdout) => {});
  },
  appendPath: function(dir, name) {
    if(dir == path.sep) {
      return path.sep + name;
    } else {
      return dir + path.sep + name;
    }
  },
  getStats: function(file) {
    return fs.statSync(file);
  },
  readFile: function(file) {
    return fs.readFileSync(file);
  },
  renameEntry: function(oldE, newE) {
    childProcess.execSync('mv "' + oldE + '" "' + newE + '"');
  },
  createFile: function(file) {
    childProcess.execSync('touch "' + file + '"');
  },
  createDir: function(dir) {
    childProcess.execSync('mkdir "' + dir + '"');
  },
  loadJavaScript: function(file) {
    var result = '';

    //
    // Read in the JavaScript file and run it. It should return an extension object.
    //
    var jfile = this.readFile(file);
    try {
      var scriptFunction = new Function('',jfile);
      result = scriptFunction();
    }catch(e) {
      result = null;
    }
    return(result);
  }
}

export default windows;
