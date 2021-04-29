//
// File:      extensions.js
//
// Description: This object contains the extensions used and interacts with them.
//

var extensions = {
  fileSystems: null,
  commands: null,
  extCommandList: [],
  extensionList: [],
  extensionDir: '',
  localFS: null,
  load: function(lFS) {
    //
    // Load the extensions from the file system. The extension directory 
    // contains each extension in it's own directory. Each extension should 
    // have a standard `package.json` that all npm packages have. This json 
    // will also have fields for the extension as follows:
    //
    //{
    //  ...
    //  mfmextension: {
    //    name: 'name of the extension',
    //    description: 'description of the extension',
    //    type: 0, // This a designation as the extensions origin: 0 - local, 1 - github
    //    github: 'address to the extension on GitHub',
    //    main: 'name of the JavaScript file'
    //  }
    //}
    //
    // Single files in the extensions directory will be ignored.
    //
    extensions.localFS = lFS;
    try{
      var items = extensions.localFS.readDir(extensions.extensionDir);
      var stats = [];
      for (var i=0; i<items.length; i++) {
        const extsDir = extensions.localFS.appendPath(extensions.extensionDir,items[i]);
        try {
          stats = extensions.localFS.getStats(extsDir);
          if(stats.isDirectory()) {
            //
            // An extension directory. Load it!
            //
            const paramfile = extensions.localFS.appendPath(extsDir, 'package.json');
            if(extensions.localFS.fileExists(paramfile)) {
              const parms = JSON.parse(extensions.localFS.readFile(paramfile).toString());
              if(typeof parms.mfmextension !== 'undefined') {
                const extension = extensions.localFS.loadJavaScript(extensions.localFS.appendPath(extsDir, parms.mfmextension.main));
                if(extension !== null) {
                  extensions.addExtension(parms.mfmextension.name, parms.mfmextension.description, extension, parms.mfmextension.type, parms.mfmextension.github);
                } else {
                  console.log("Extension didn't load.");
                }
              } else {
                console.log("Extension: " + extsDir + " isn't configured correctly.");
              }
            }
          } 
        } catch(e) {
            //
            // There was a problem getting the stats. Therefore, it's not a file or 
            // directory we need.
            //
            console.log(e);
        }
      }
    } catch(e) {
      //
      // Something went wrong.
      //
    }
  },
  setExtensionDir: function(dir) {
    extensions.extensionDir = dir;
  },
  getExtensionDir: function() {
    return extensions.extensionDir;
  },
  getConfigDir: function() {
    return extensions.localFS.getConfigDir();
  },
  setFileSystems: function(fs) {
    extensions.fileSystems = fs;
  },
  getFileSystems: function() {
    return extensions.fileSystems;
  },
  setCommands: function(com) {
    extensions.commands = com;
  },
  getCommands: function() {
    return extensions.commands;
  },
  addExtCommand: function(name, description, extCommand) {
    //
    // Add it to the stack.
    //
    extensions.extCommandList.push({
      name: name,
      description: description,
      command: extCommand
    });
  },
  listExtCommands: function() {
    return extensions.extCommandList.map(item => {
      return { name: item.name, description: item.description};
    });
  },
  getExtCommand: function(name) {
    return(extensions.extCommandList.find(item => item.name === name));
  },
  addExtension: function(name, description, extension, type, github) {
    //
    // Add it to the stack.
    //
    extensions.extensionList.push({
      name: name,
      description: description,
      extension: extension,
      type: type,
      github: github
    });
  },
  init: function() {
    if(extensions.extensionList !== null) {
      extensions.extensionList.forEach(item => {
        if(typeof item.extension !== 'undefined') item.extension.init(extensions);
      });
    }
  },
  installKeyMaps: function() {
    if(extensions.extensionList !== null) {
      extensions.extensionList.forEach(item => {
        if(typeof item.extension !== 'undefined') item.extension.installKeyMaps();
      });
    }
  },
  getExtension: function(ext) {
    return extensions.extensionList.find((item) => { item.name == ext });
  },
  listExtensions: function() {
    return extensions.extensionList.map(item => {
      return {
        name: item.name,
        description: item.description
      };
    })
},
  removeExtension: function(ext) {
    extensions.extensionList = extensions.extensionList.filter(item => item.name != ext);
  },
  getLocalFS: function() {
    return extensions.localFS;
  }
}

export default extensions;

