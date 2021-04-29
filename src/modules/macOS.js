//
// File:    macOS.js
//
// Description:   This file contains all low level 
//                functions that would be OS dependent.  
//

const path = require('path');
const os = require('os');
const fs = require('fs');
const childProcess = require('child_process');

var macOS = {
  dirFirst: true,
  sortFunction: null,
  filterFunction: null,
  lastError: '',
  lastOutput: '',
  getExtension: function(file) {
    return path.extname(file);
  },
  getConfigDir: function() {
    return this.appendPath(this.getHomeDir(), '.config/modalfilemanager');
  },
  terminalScript: "bin/openTerminal.scpt",
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
    return this.appendPath(this.getHomeDir(), this.terminalScript);
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
    if(typeof dir === 'object') dir = this.appendPath(dir.dir, dir.name);
    return fs.readdirSync(this.preserveQuotes(dir));
  },
  normalize: function(dir) {
    if(dir[0] === '~') dir = this.appendPath(this.getHomeDir(),dir.slice(1,dir.length));
    dir = path.normalize(dir);
    return(dir);
  },
  dirExists: function(dir) {
    if((typeof dir === 'object') && (typeof dir.name !== 'undefined')) dir = this.appendPath(dir.dir, dir.name);
    return this.fileExists(this.preserveQuotes(dir));
  },
  fileExists: function(file) {
    var result = true;
    if(typeof file === 'object') file = this.preserveQuotes(this.appendPath(file.dir, file.name));
    try {
      fs.accessSync(file);
      result = true;
    } catch(e) {
      result = false;
    }
    return result;
  },
  makeDir: function(dir) {
    if(typeof dir.name !== 'undefined') dir = this.appendpath(dir.dir, dir.name);
    fs.mkdirSync(this.preserveQuotes(dir));
  },
  preserveQuotes: function(str) {
    return(str);
  },
  moveEntries: function(from, to, callback) {
    var fromName = this.preserveQuotes(from.fileSystem.appendPath(from.dir, from.name));
    var toName = this.preserveQuotes(to.dir);
    var that = this;
    if(typeof callback === 'undefined') {
      childProcess.exec("mv '" + fromName + "' '" + toName + "'",(err,stdout) => {
        if(err) that.lastError = err;
        that.lastOutput = stdout;
      });
    } else {
      childProcess.exec("mv '" + fromName + "' '" + toName + "'", callback);
    }
  },
  copyEntries: function(from, to, flag, callback) {
    if(typeof flag === 'undefined') flag = false;
    var fromName = this.preserveQuotes(from.fileSystem.appendPath(from.dir, from.name));
    var toName = this.preserveQuotes(to.dir);
    if(flag) {
      toName = this.preserveQuotes(to.fileSystem.appendPath(to.dir,to.name));
    }
    var that = this;
    if(typeof callback === 'undefined') {
      childProcess.exec("cp -R '" + fromName + "' '" + toName + "'",(err,stdout) => {
        if(err) that.lastError = err;
        that.lastOutput = stdout;
      });
    } else {
      childProcess.exec("cp -R '" + fromName + "' '" + toName + "'", callback);
    }
  },
  deleteEntries: function(entry, callback) {
    var item = this.preserveQuotes(entry.fileSystem.appendPath(entry.dir, entry.name));
    var that = this;
    if(typeof callback === 'undefined') {
      childProcess.exec("rm -R '" + item + "'",(err,stdout) => {
        if(err) that.lastError = err;
        that.lastOutput = stdout;
      });
    } else {
      childProcess.exec("rm -R '" + item + "'", callback);
    }
  },
  getDirList: function(dir) {
    //
    // A directory list is provided giving an array of entry object. Each 
    // entry object has:
    //    name    The name of the file
    //    type    The type of the entry: a file - 0, a directory - 1, a link - 2
    //    fileSystem  The current file system object
    //    dir     The directory of the file
    //    datetime  The creation datetime of the file
    //    size    The integer size of the file in 1kb (Directories and links have zero size)
    //    selected Boolean true is selected, false is not selected
    //
    var entries = [];
    if((typeof dir === 'object') && (typeof dir.name !== 'undefined')) dir = this.appendPath(dir.dir, dir.name);
    dir = this.normalize(dir);
    if(this.dirExists(dir)) {
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
              fileSystemType: "macOS",
              fileSystem: this,
              selected: false,
              datetime: '',
              type: 0,
              size: 0,
              stats: null
            };
          }
          newEntry = {
            name: items[i],
            dir: dir,
            fileSystemType: "macOS",
            fileSystem: this,
            selected: false,
            datetime: stats.mtime.toLocaleString(),
            type: 0,
            size: 0,
            stats: stats
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
    }

    //
    // Return the result.
    //
    return(entries);
  },
  defaultFilter: function(item) { 
    return ((item.name[0] !== '.') &&
            (!item.name.includes('Icon')));
  },
  allFilter: function(item) {
    //
    // Still, don't show the Icon and DS_Store files.
    //
    return((!item.name.includes('Icon')) &&
           (!item.name.includes('.DS_Store')));
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
  runCommandLine: function(line, callback) {
    if(typeof callback === 'undefined') {
      childProcess.exec(line, (err, stdin, stdout) => {});
    } else {
      childProcess.exec(line, callback);
    }
  },
  appendPath: function(dir, name) {
    //
    // dir can be an entry or a path string. name is always a string.
    //
    if(typeof dir === 'object') dir = this.appendPath(dir.dir, dir.name);
    if(dir == path.sep) {
      return path.sep + name;
    } else {
      if(dir[dir.length-1] === path.sep) {
        return dir + name;
      } else {
        return dir + path.sep + name;
      }
    }
  },
  getStats: function(file) {
    return fs.statSync(file);
  },
  readFile: function(file) {
    if(typeof file === 'objct') file = this.appendPath(file.dir, file.name);
    return fs.readFileSync(file);
  },
  writeFile: function(file,data) {
    if(typeof file === 'object') file = this.appendPath(file.dir, file.name);
    fs.writeFileSync(file,data);
  },
  renameEntry: function(oldE, newE) {
    var fromName = this.preserveQuotes(oldE.fileSystem.appendPath(oldE.dir, oldE.name));
    var toName = this.preserveQuotes(newE.fileSystem.appendPath(newE.dir, newE.name));
    childProcess.execSync('mv "' + fromName + '" "' + toName + '"');
  },
  createFile: function(file) {
    var fnm = this.preserveQuotes(file.fileSystem.appendPath(file.dir, file.name));
    childProcess.execSync('touch "' + fnm + '"');
  },
  createDir: function(dir) {
    var dnm = dir;
    if(typeof dir === 'object') dnm = this.preserveQuotes(dir.fileSystem.appendPath(dir.dir, dir.name));
    childProcess.execSync('mkdir "' + dnm + '"');
  },
  loadJavaScript: function(file) {
    var result = '';
    
    //
    // Read in the JavaScript file and run it. It should return an extension object.
    //
    var jfile = this.readFile(file).toString();
    try {
      var scriptFunction = new Function('',jfile);
      result = scriptFunction();
    }catch(e) {
      console.log(e);
      this.lastError = e.toString();
      result = null;
    }
    return(result);
  },
  searchDir: function(pat, dir, numEntries, returnFunction) {
    try {
      if(dir === '') dir = this.pathSep();
      if(pat !== '') {
        childProcess.exec('/usr/local/bin/fd -i --max-results ' + numEntries + ' -t d "' + pat + '" "' + dir + '"', (err, data) => {
          if(err) { 
            console.log(err);
            this.lastError = err.toString();
          } else {
            returnFunction(data.toString().split('\n'));
          }
        });
      }
    } catch(e) {
      console.log(e);
      this.lastError = e.toString();
    }
  }
}

export default macOS;
