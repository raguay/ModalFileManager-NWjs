<svelte:window 
  on:keydown={(e) => {
    lctrlKey = e.ctrlKey;
    lshiftKey = e.shiftKey;
    lmetaKey = e.metaKey;
    if(skipKey && (e.key === 'Enter')) {
      skipKey = false;
      keyProcess.set(true);
      localKeyProcess = true;
    } else {
      skipKey = false;
      if(localKeyProcess) {
        processKey(e);
      }
    }
  }}
  on:keyup={(e) => {
    lctrlKey = e.ctrlKey;
    lshiftKey = e.shiftKey;
    lmetaKey = e.metaKey;
  }}
/>

<div id='container'
  style="background-color: {$theme.backgroundColor};
         color: {$theme.textColor};
         font-family: {$theme.font};
         font-size: {$theme.fontSize};"
  on:mousemove={mouseMove}
  on:mouseup={e => {
    mdown = false;
  }}
  bind:this={containerDOM}
>

  {#if showGitHub}
    <GitHub 
      on:closeGitHub={(e) => {
        toggleGitHub();
      }}
    />
  {/if}

  {#if showCommandPrompt}
    <CommandPrompt 
      commands={commands}
      on:closeCommandPrompt={(e) => {
        showCommandPrompt = false;
        if(!showMessageBox) {
          keyProcess.set(true);
          localKeyProcess = true;
        }
        if(e.detail.skip) skipKey = true;
      }}
    />
  {/if}

  {#if showMessageBox}
    <MessageBox
      config={msgBoxConfig}
      spinners={msgBoxSpinners}
      items={msgBoxItems}
      on:msgReturn={msgReturn}
      on:closeMsgBox={(e) => { 
        showMessageBox = false;
        keyProcess.set(true);
        localKeyProcess = true;
        if(e.detail.skip) skipKey = true;
      }}
    />
  {/if}

  {#if showQuickSearch}
    <QuickSearch
      leftDOM={leftDOM}
      rightDOM={rightDOM}
      leftEntries={leftEntries}
      rightEntries={rightEntries}
      on:changeEntries={qsChangeEntries}
      on:closeQuickSearch={(e) => { 
        showQuickSearch = false;
        keyProcess.set(true);
        localKeyProcess = true;
        if(e.detail.skip) skipKey = true;
      }}
    />
  {/if}

  <div id='leftSide'
       bind:this={leftDOM}>
    {#if (localCurrentCursor.pane === 'right')&&(showExtra)}
      <ExtraPanel
      />
    {:else}
      <DirectoryListing
        path={localLeftDir}
        edit={setEditDirFlagLeft}
        on:dirChange={(e) => { changeDir(e.detail, 'left'); setEditDirFlagLeft = false; }}
      />
      <Pane 
        pane='left'
        entries={leftEntries}
        utilities={localLeftDir.fileSystem}
        on:changeDir={(e) => { changeDir(e.detail.dir, e.detail.pane); }}
        on:openFile={(e) => { openFile(e.detail.entry); }}
      />
    {/if}
  </div>
  <ResizeBorder 
    on:mouseDown={(e) => {mdown = e.detail;}}
  />
  <div id='rightSide'
       bind:this={rightDOM}
  >
    {#if (localCurrentCursor.pane === 'left')&&(showExtra)}
      <ExtraPanel
      />
    {:else}
      <DirectoryListing
        path={localRightDir}
        edit={setEditDirFlagRight}
        on:dirChange={(e) => { changeDir(e.detail, 'right'); setEditDirFlagRight = false; }}
      />
      <Pane 
        pane='right'
        entries={rightEntries}
        utilities={localRightDir.fileSystem}
        on:changeDir={(e) => {changeDir(e.detail.dir, e.detail.pane); }}
        on:openFile={(e) => { openFile(e.detail.entry); }}
      />
    {/if}
  </div>
  <StatusLine 
  />
</div>

<style>
  #leftSide {
    display: flex;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    width: 50%;
  }
  
  #rightSide {
    display: flex;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    width: 50%;
  }


  :global(body) {
    padding: 0px;
    margin: 0px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;
  }

  #container {
    padding: 0px;
    margin: 0px;
    display: flex;
    flex-direction: row;
    position: fixed;
    top: 0px;
    bottom: 34px;
    width: 100%;
  }
</style>

<script>
  import { onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import Pane from './components/Pane.svelte';
  import MessageBox from './components/MessageBox.svelte';
  import DirectoryListing from './components/DirectoryListing.svelte';
  import StatusLine from './components/StatusLine.svelte';
  import ResizeBorder from './components/ResizeBorder.svelte';
  import QuickSearch from './components/QuickSearch.svelte';
  import ExtraPanel from './components/ExtraPanel.svelte';
  import CommandPrompt from './components/CommandPrompt.svelte';
  import GitHub from './components/GitHub.svelte';
  import { currentCursor } from './stores/currentCursor.js';
  import { currentLeftFile } from './stores/currentLeftFile.js';
  import { currentRightFile } from './stores/currentRightFile.js';
  import { theme } from './stores/theme.js';
  import { inputState } from './stores/inputState.js';
  import { leftDir } from './stores/leftDir.js';
  import { rightDir } from './stores/rightDir.js';
  import { keyProcess } from './stores/keyProcess.js';
  import { config } from './stores/config.js';
  import { dirHistory } from './stores/dirHistory.js';
  import { directoryListeners } from './stores/directoryListeners.js';
  import { stateMapColors } from './stores/stateMapColors.js';
  import commands from './modules/commands.js';
  import filesystems from './modules/filesystems';
  import extensions from './modules/extensions.js';
  import macOS from './modules/macOS.js';
  import linux from './modules/linux.js';
  import windows from './modules/windows.js';
  
  const os = require('os');

  let showMessageBox = false;
  let showQuickSearch = false;
  let msgBoxConfig = {};
  let msgBoxSpinners = [];
  let msgBoxItems = null;
  let msgCallBack = (e) => {};
  let configDir = "";
  let setEditDirFlagLeft = false;
  let setEditDirFlagRight = false;
  let showExtra = false;
  let showCommandPrompt = false;
  let skipKey = false;
  let leftEntries;
  let rightEntries;
  let localCurrentCursor = {
    pane: 'left',
    entry: {}
  };
  let localCurrentLeftFile;
  let localCurrentRightFile;
  let localTheme;
  let localState = 'normal';
  let localLeftDir = {
    fileSystemType: 'macOS',
    fileSystem: null,
    path: 'left'
  };
  let localRightDir = {
    fileSystemType: 'macOS',
    fileSystem: null,
    path: 'right'
  };
  let rightDOM;
  let leftDOM;
  let containerDOM;
  let localKeyProcess;
  let mdown = false;
  let lastError = null;
  let userEditor = '.myeditorchoice';
  let localFS = null;
  let localFStype = '';
  let osNames = ['macOS', 'linux', 'windows'];
  let stateMaps = [];
  let localStateMapColors;
  let localDirListeners = null;
  let showGitHub = false;
  let numberAcc = '';
  let lshiftKey = false;
  let lctrlKey = false;
  let lmetaKey = false;
  let lastCommand = '';
  let flagFilter = 1;

  onMount(() => {
    // 
    // Get the local file system utilities.
    // 
    localFStype = getOS();
    switch(localFStype) {
      case osNames[0]:
        localFS = macOS;
        break;
      case osNames[1]: 
        localFS = linux;
        break;
      case osNames[2]: 
        localFS = windows;
        break;
      default:
        localFS = macOS;
    }

    //
    // Initialize local.
    //
    localFS.init();
    localFS.setDirFirst(true);

    // 
    // Setup the configuration directory.
    //
    configDir = localFS.getConfigDir();
    if(!localFS.dirExists(configDir)) {
      localFS.makeDir(configDir);
      localFS.makeDir({
        dir: configDir,
        name: 'extensions',
        fileSystem: localFS
      });
    }

    // 
    // Set the configuration store.
    //
    config.set({
      configDir: configDir,
      localFS: localFS
    });

    //
    // Setup the directory listeners.
    //
    var unsubscribeDirListeners = directoryListeners.subscribe(value => {
      localDirListeners = value;
    })

    //
    // Here, we are subscribing to the different stores and setting their 
    // default values;
    //
    var unsubscribeLeftDir = leftDir.subscribe(value => {
      localLeftDir = value;
    });
    var unsubscribeRightDir = rightDir.subscribe(value => {
      localRightDir = value;
    });
    
    //
    // Setup the application to be in the user's home directory.
    //
    localLeftDir.path = localFS.getHomeDir();
    localLeftDir.fileSystemType = localFStype;
    localLeftDir.fileSystem = localFS;
    localRightDir.path = localFS.getHomeDir();
    localRightDir.fileSystemType = localFStype;
    localRightDir.fileSystem = localFS;

    //
    // Get the files.
    //
    leftEntries = localFS.getDirList(localLeftDir.path);
    rightEntries = localFS.getDirList(localRightDir.path);

    //
    // Set the stores to their proper value.
    //
    leftDir.set(localLeftDir);
    rightDir.set(localRightDir);
 
    var unsubscribeCurrentCursor = currentCursor.subscribe(value => {
      localCurrentCursor = value;
    });
    currentCursor.set({
      pane: 'left',
      entry: leftEntries[0]
    });
    var unsubscribeCurrentLeftFile = currentLeftFile.subscribe(value => {
      localCurrentLeftFile = value;
    });
    currentLeftFile.set({
      entry: leftEntries[0]
    });
    var unsubscribeCurrentRightFile = currentRightFile.subscribe(value => {
      localCurrentRightFile = value;
    });
    currentRightFile.set({
      entry: rightEntries[0]
    });
    var unsubscribeTheme = theme.subscribe(value => {
      // 
      // Make sure a proper theme is being set.
      // 
      if(typeof value.backgroundColor !== 'undefined') {
        //
        // Keep a local copy.
        // 
        localTheme = value;
 
        // 
        // Save the new theme values.
        //
        localFS.writeFile(localFS.appendPath(configDir, 'theme.json'), JSON.stringify(value));

        //
        // Set the default state map colors.
        //
        localStateMapColors['normal'] = localTheme.normalbackgroundColor;
        localStateMapColors['insert'] = localTheme.insertbackgroundColor;
        localStateMapColors['visual'] = localTheme.visualbackgroundColor;
        stateMapColors.set(localStateMapColors);
      }
    });
    var unsubscriptStateMapColors = stateMapColors.subscribe(value => {
      localStateMapColors = value;
    });
    var unsubscribeInputState = inputState.subscribe(value => {
      localState = value;
    });
    inputState.set(localState);
    var unsubscribeKeyProcess = keyProcess.subscribe(value => {
      localKeyProcess = value;
      console.log('Key Process changed...');
      console.log(value);
    });

    // 
    // Setup the directory history.
    //
    var dhist = get(dirHistory);
    dhist.loadHistory();
    dirHistory.set(dhist);

    //
    // Setup the default commands.
    //
    installDefaultCommands();

    // 
    // load the theme.
    //
    if(!localFS.fileExists(localFS.appendPath(configDir, 'theme.json'))) {
      // 
      // Setup the Dracula Pro as default theme colors:
      //
      localTheme = {
        font: "Fira Code, Menlo",
        fontSize: "12pt",
        cursorColor: '#363443',
        selectedColor: '#454158',
        backgroundColor: '#22212C',
        textColor: '#F8F8F2',
        borderColor: '#1B1A23',
        normalbackgroundColor: "#80FFEA",
        insertbackgroundColor: "#8AFF80",
        visualbackgroundColor: "#FF80BF",
        commentColor: "#7970A9",
        Cyan: "#80FFEA",
        Green: "#8AFF80",
        Orange: "#FFCA80",
        Pink: "#FF80BF",
        Purple: "#9580FF",
        Red: "#FF9580",
        Yellow: "#FFFF80"
      };

      // 
      // Save the default theme.
      //
      localFS.writeFile(localFS.appendPath(configDir, 'theme.json'), JSON.stringify(localTheme));
    } else {
      //
      // Load the theme saved.
      //
      localTheme = JSON.parse(localFS.readFile(localFS.appendPath(configDir, 'theme.json')));
    }

    //
    // Get the stateMapColors setup.
    //
    localStateMapColors['normal'] = localTheme.normalbackgroundColor;
    localStateMapColors['insert'] = localTheme.insertbackgroundColor;
    localStateMapColors['visual'] = localTheme.visualbackgroundColor;
    stateMapColors.set(localStateMapColors);

    //
    // Set the theme.
    //
    theme.set(localTheme);

    //
    // Setup the user editor data file.
    //
    userEditor = localFS.appendPath(localFS.getHomeDir(), '.myeditorchoice');
    if(!localFS.fileExists(userEditor)) {
      if(!localFS.fileExists(localFS.appendPath(configDir, '.myeditorchoice'))) {
        // 
        // They don't have this file setup. TODO: Set it up or not?
        //
      } else {
        // 
        // Use this file then.
        // 
        userEditor = localFS.appendPath(configDir, '.myeditorchoice');
      }
    }
    
    //
    // Setup Extensions.
    //
    const extDir = localFS.appendPath(configDir, 'extensions');
    extensions.setExtensionDir(extDir);
    extensions.setCommands(commands);
    extensions.setFileSystems(filesystems);
    extensions.load(localFS);
    installDefaultExtCommands();
    extensions.init();

    //
    // Setup State Maps. This has to be after setting up extensions in case 
    // an extension command is being used.
    //
    loadKeyMaps();
    extensions.installKeyMaps();

    //
    // return a command to unsubscribe from everything.
    //
    return(() => {
      unsubscribeKeyProcess();
      unsubscribeInputState();
      unsubscribeTheme();
      unsubscribeCurrentRightFile();
      unsubscribeCurrentLeftFile();
      unsubscribeCurrentCursor();
      unsubscribeRightDir();
      unsubscribeLeftDir();
      unsubscribeDirListeners();
      unsubscriptStateMapColors();
    })
  });

  function getOS() {
    var result = osNames[0];
    var platform = os.platform();
    switch(platform) { 
        case 'aix': 
            result = osNames[1]
            break; 
        case 'android': 
            result = osNames[1]
            break; 
        case 'darwin': 
            result = osNames[0]
            break; 
        case 'freebsd': 
            result = osNames[1]
            break; 
        case 'linux': 
            result = osNames[1]
            break; 
        case 'openbsd': 
            result = osNames[1]
            break; 
        case 'sunos': 
            result = osNames[1]
            break; 
        case 'win32':
            result = osNames[2]
            break;     
        default: 
            result = osNames[1]
    } 
    return result;
  }

  function installDefaultExtCommands() {
    extensions.addExtCommand('setCursor','Set the cursor to the file name given in the current panel.', setCursor);
    extensions.addExtCommand('cursorToPane', 'Set the cursor to the pane given. Either "left" or "right", cursorToPane');
    extensions.addExtCommand('changeDir', 'Change the directory of a pane and make it the current.', changeDir);
    extensions.addExtCommand('getLeftFile', 'Get the current left file information.', getLeftFile);
    extensions.addExtCommand('getRightFile', 'Get the current right file information.', getRightFile);
    extensions.addExtCommand('getCursor', 'Get the current cursor.', getCursor);
    extensions.addExtCommand('addKeyboardShort', 'Add a keyboard shortcut.', addKeyboardShort);
    extensions.addExtCommand('setTheme', 'Set the theme to the values given.', setTheme);
    extensions.addExtCommand('getTheme', 'Get the current theme values.', getTheme);
    extensions.addExtCommand('getOS', 'Get the local OS name.', getOS);
    extensions.addExtCommand('addDirectoryListener', 'Register a function that will be called with each change in directory.', addDirectoryListener);
    extensions.addExtCommand('getLastError', 'returns the last error.', getLastError);
    extensions.addExtCommand('getSelectedFiles', 'Returns a list of Entries that have been selected', getSelectedFiles);
    extensions.addExtCommand('getCurrentFile', 'Get the current file.', getCurrentFile);
    extensions.addExtCommand('getCurrentPane', 'Get the pane that is currently active.', getCurrentPane);
    extensions.addExtCommand('changeDir', 'Change the current directory for a pane.', changeDir);
    extensions.addExtCommand('addSpinner', 'Add a message box spinner value.', addSpinner);
    extensions.addExtCommand('updateSpinner', 'Update a message box spinner value.', updateSpinner);
    extensions.addExtCommand('removeSpinner', 'Remove a message box spinner value.', removeSpinner);
    extensions.addExtCommand('keyProcessor', 'Send a keystroke to be processed.', keyProcessor);
    extensions.addExtCommand('stringKeyProcessor', 'Send a string of keystrokes to be processed.', stringKeyProcessor);
    extensions.addExtCommand('askQuestion', 'Ask a question and get the response.', askQuestion);
    extensions.addExtCommand('pickItem', 'Choose from a list of items.', pickItem);
    extensions.addExtCommand('showMessage', 'Show a message to the user.', showMessage);
    extensions.addExtCommand('createNewMode', 'Allows the creation of a new mode for keyboard commands.', createNewMode);
    extensions.addExtCommand('changeMode', 'Change to mode given.', changeMode);
  }

  function installDefaultCommands() {
    //
    // Add all built in commands to the commands object.
    //
    commands.addCommand('Move Cursor Down','moveCursorDown','Move the cursor down one line.',moveCursorDown);
    commands.addCommand('Move Cursor Down with Selection', 'moveCursorDownWithSelect','This will select the current file and move the cursor down one line.',moveCursorDownWithSelect);
    commands.addCommand('Move Cursor Up','moveCursorUp','This will move the cursor up one line',moveCursorUp);
    commands.addCommand('Move Cursor Up with Selection','moveCursorUpWithSelect','This will move select the current entry and move the cursor up one line.',moveCursorUpWithSelect);
    commands.addCommand('Change Mode to Normal','changeModeNormal','Set the normal mode.',changeModeNormal);
    commands.addCommand('Change Mode to Insert','changeModeInsert','Set the insert mode.',changeModeInsert);
    commands.addCommand('Change Mode to Visual','changeModeVisual','Set the visual mode.',changeModeVisual);
    commands.addCommand('Cursor to Next Pane','cursorToNextPane','This will move the cursore to the opposite pane.',cursorToNextPane);
    commands.addCommand('Action Entry','actionEntry','This will open a file or go into a directory.',actionEntry);
    commands.addCommand('Go Up a Directory','goUpDir','Go to the parent directory.',goUpDir);
    commands.addCommand('Go Down a Directory','goDownDir','If the current entry is a directory, go to it.',goDownDir);
    commands.addCommand('Go to Bottom Entry','goBottomFile','Move the cursor to the bottom most file.',goBottomFile);
    commands.addCommand('Go to Top Entry','goTopFile','Move the cursor to the top most file.',goTopFile);
    commands.addCommand('Delete Entries', 'deleteEntries', 'Delete all selected entries or the one under the cursor', deleteEntries);
    commands.addCommand('Copy Entries', 'copyEntries', 'Copy the selected entries or the one under the cursor to the other pane.', copyEntries);
    commands.addCommand('Move Entries', 'moveEntries', 'Move the selected entries or the one under the cursor to the other pane.', moveEntries);
    commands.addCommand('Edit Entry', 'editEntry', 'Opens the file under the cursor in the editor specified. This command assumes using a Text/Code editor on the file.', editEntry);
    commands.addCommand('Duplicate Entry', 'duplicateEntry', 'Make a copy of the current entry with "_copy" added to it.', duplicateEntry);
    commands.addCommand('New File', 'newFile', 'Create a new file in the current pane.', newFile);
    commands.addCommand('New Directory', 'newDirectory', 'Create a new directory in the current pane.', newDirectory);
    commands.addCommand('Rename Entry', 'renameEntry', 'Rename the current entry.', renameEntry);
    commands.addCommand('Swap Panels', 'swapPanels', 'Swap the panel contents.', swapPanels);
    commands.addCommand('Toggle Quick Search', 'toggleQuickSearch', 'Show/Hide the Quick Search panel.', toggleQuickSearch);
    commands.addCommand('Reload Pane', 'reloadPane', 'Reload the Current Pane.', reloadPane);
    commands.addCommand('Edit Directory', 'editDirLoc', 'Edit the current panels directory.', editDirLoc);
    commands.addCommand('Toggle Extra Panel', 'toggleExtraPanel', 'Toggles the showing of the extra panel.', toggleExtraPanel);
    commands.addCommand('Toggle Command Prompt', 'toggleCommandPrompt', 'Toggles showing the command prompt.', toggleCommandPrompt);
    commands.addCommand('Toggle GitHub Importer', 'toggleGitHub', 'Toggles the showing of the GitHub importer.', toggleGitHub);
    commands.addCommand('Refresh Panes', 'refreshPanes', 'Reloads both panes.', refreshPanes);
    commands.addCommand('Refresh Right Pane', 'refreshRightPane', 'Refresh the Right Pane', refreshRightPane);
    commands.addCommand('Refresh Left Pane', 'refreshLeftPane', 'Reloads the Left Pane.', refreshLeftPane);
    commands.addCommand('Rerun Last Command', 'reRunLastCommand', 'Runs the last command with it\'s number.', reRunLastCommand);
    commands.addCommand('Toggle Filter', 'toggleFilter', 'Toggles the show all and default filters.', toggleFilter );
    commands.addCommand('Show All Filter', 'setShowAllFilter', 'Sets to show all Entries.', setShowAllFilter);
    commands.addCommand('Show Only Non-System Files/Folders', 'setDefaultFilter', 'Sets the default filter of not showing system files/folders.', setDefaultFilter);
    commands.addCommand('Open in Opposite Panel', 'openOppositePanel', 'Set the opposite panel to the directory under the current cursor or the directory of the current cursor.', openOppositePanel);
  }
  
  function processKey(e) {
    //
    // Stop the system for propgating the keystroke.
    //
    e.preventDefault();

    // 
    // Send to the processor.
    //
    keyProcessor(e.key, lctrlKey, lshiftKey, lmetaKey);
  }

  function stringKeyProcessor(str) {
    for(var i=0; i < str.length; i++) {
      if((str[i] >= 'A')&&(str[i] <= 'Z')) {
        keyProcessor(str[i], false, true, false);
      } else {
        keyProcessor(str[i], false, false, false);
      }
    }
  }

  function reRunLastCommand() {
    stringKeyProcessor(lastCommand);
  }

  function keyProcessor(key, ctrlKey, shiftKey, metaKey) {

    if((key >= 0)&&(key <=9)) {
      // 
      // It is a number prefixing a command. Get the digits for using in the command.
      // 
      numberAcc += key;
    } else {
      //
      // Get the command for the current state in the stateMaps.
      //
      
      const command = getCommand(stateMaps[localState], key, ctrlKey, shiftKey, metaKey);
      
      // 
      // Figure the number of times to run the command.
      // 
      var num = parseInt(numberAcc,10);
      if((num === 0)||(isNaN(num))) num = 1;
      if(command.name !== 'reRunLastCommand') lastCommand = numberAcc + key;

      //
      // Run the command.
      //
      try {
        do {
          command.command();
        } while((num--) > 1);
      } catch(e) {
        //
        // Something happened in the command. Tell about it.
        //
        lastError = e;
        console.log(e);
      }
      numberAcc = '';
    }
  }

 function createNewMode(name, color) {
    stateMaps[name] = [];
    localStateMapColors[name] = color;
    stateMapColors.set(localStateMapColors);
 }

 function getCommand(map, key, ctrlKey, shiftKey, metaKey) {
     var result = {
      command: () => {},
      name: 'empty'
    };
    var rmap = map.find(item => ((item.key == key) && (item.meta == metaKey) && (item.ctrl == ctrlKey) && (item.shift == shiftKey)));
    if(typeof rmap !== 'undefined') {
      result = rmap;
    }
    return result;
  }

  function setCursor(fname){
    var index = 0;
    if(localCurrentCursor.pane == 'left') {
      index = leftEntries.findIndex(item => item.name == fname);
      if(index === -1) index = 0;
      currentCursor.set({
        pane: 'left',
        entry: leftEntries[index]
      });
      currentLeftFile.set({
        entry: leftEntries[index]
      });
    } else {
      index = rightEntries.findIndex(item => item.name == fname);
      if(index === -1) index = 0;
      currentCursor.set({
        pane: 'right',
        entry: rightEntries[index]
      });
      currentRightFile.set({
        entry: rightEntries[index]
      });
    }
  }

  function moveCursorDown() {
    var index = 0;
    if(localCurrentCursor.pane.includes('left')) {
      if(leftEntries.length !== 0) {
        index = leftEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index < (leftEntries.length-1)) {
          index += 1;
        }
        currentCursor.set({
          pane: 'left',
          entry: leftEntries[index]
        });
        currentLeftFile.set({
          entry: leftEntries[index]
        });
      }
    } else {
      if(rightEntries.length !== 0) {
        index = rightEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index < (rightEntries.length-1)) {
          index += 1;
        }
        currentCursor.set({
          pane: 'right',
          entry: rightEntries[index]
        });
        currentRightFile.set({
          entry: rightEntries[index]
        });
      }
    }
  }

  function moveCursorDownWithSelect() {
    var index = 0;
    if(localCurrentCursor.pane.includes('left')) {
      if(leftEntries.length !== 0 ) {
        index = leftEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index === -1) index = 0;
        var entry = leftEntries[index];
        entry.selected = !entry.selected;
        leftEntries[index] = entry;
        if(index < (leftEntries.length-1)) {
          index += 1;
        }
        entry = leftEntries[index];
        currentCursor.set({
          pane: 'left',
          entry: entry
        });
        currentLeftFile.set({
          entry: entry
        });
      }
    } else {
      if(rightEntries.length !== 0) {
        index = rightEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index === -1) index = 0;
        var entry = rightEntries[index];
        entry.selected = !entry.selected;
        rightEntries[index] = entry;
        if(index < (rightEntries.length-1)) {
          index += 1;
        }
        entry = rightEntries[index];
        currentCursor.set({
          pane: 'right',
          entry: entry
        });
        currentRightFile.set({
          entry: entry
        });
      }
    }
  }

  function moveCursorUp() {
    var index = 0;
    if(localCurrentCursor.pane.includes('left')) {
      if(leftEntries.length !== 0) {
        index = leftEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index > 0) {
          index -= 1;
        }
        if(index === -1) index = 0;
        currentCursor.set({
          pane: 'left',
          entry: leftEntries[index]
        });
        currentLeftFile.set({
          entry: leftEntries[index]
        });
      }
    } else {
      if(rightEntries.length !== 0) {
        index = rightEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index > 0) {
          index -= 1;
        }
        if(index === -1) index = 0;
        currentCursor.set({
          pane: 'right',
          entry: rightEntries[index]
        });
        currentRightFile.set({
          entry: rightEntries[index]
        });
      }
    }
  }

  function moveCursorUpWithSelect() {
    var index = 0;
    if(localCurrentCursor.pane.includes('left')) {
      if(leftEntries.length !== 0) {
        index = leftEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index === -1) index = 0;
        var entry = leftEntries[index];
        entry.selected = !entry.selected;
        leftEntries[index] = entry;
        if(index > 0) {
          index -= 1;
        }
        entry = leftEntries[index];
        currentCursor.set({
          pane: 'left',
          entry: entry
        });
        currentLeftFile.set({
          entry: entry
        });
      }
    } else {
      if(rightEntries.length !== 0) {
        index = rightEntries.findIndex(item => item.name == localCurrentCursor.entry.name);
        if(index === -1) index = 0;
        var entry = rightEntries[index];
        entry.selected = !entry.selected;
        rightEntries[index] = entry;
        if(index > 0) {
          index -= 1;
        }
        entry = rightEntries[index];
        currentCursor.set({
          pane: 'right',
          entry: entry
        });
        currentRightFile.set({
          entry: entry
        });
      }
    }
  }

  function changeMode(newMode) {
    inputState.set(newMode);
    localState = newMode;
  }

  function changeModeNormal() {
    changeMode('normal');
  }
  
  function changeModeInsert() {
    changeMode('insert');
  }
  
  function changeModeVisual() {
    changeMode('visual');
  }

  function openOppositePanel() {
    var nEntry = localCurrentCursor.entry.dir;
    if(localCurrentCursor.entry.type === 1) {
      nEntry = localCurrentCursor.entry.fileSystem.appendPath(localCurrentCursor.entry.dir, localCurrentCursor.entry.name);
    }
    if(localCurrentCursor.pane === 'right') {
      changeDir({
        path: nEntry,
        cursor: true
      },'left');
    } else {
      changeDir({
        path: nEntry,
        cursor: true
      },'right');
    }
  }

  function cursorToPane(npane) {
    if(npane == 'right') {
      currentCursor.set({
        pane: 'right',
        entry: localCurrentRightFile.entry
      })
    } else {
      currentCursor.set({
        pane: 'left',
        entry: localCurrentLeftFile.entry
      })
    }
  }

  function cursorToNextPane() {
    if(localCurrentCursor.pane == 'left') {
      currentCursor.set({
        pane: 'right',
        entry: localCurrentRightFile.entry
      })
    } else {
      currentCursor.set({
        pane: 'left',
        entry: localCurrentLeftFile.entry
      })
    }
  }

  function mouseMove(e) {
    if(mdown) {
      leftDOM.style.width = e.clientX + 'px';
      rightDOM.style.width = (containerDOM.clientWidth - (e.clientX+10)) + 'px';
    }
  }

  function reloadPane() {
    changeDir({
      path: localCurrentCursor.entry.dir,
      cursor: true
    }, localCurrentCursor.pane);
  }

  function changeDir(dirOb, npane) {
    var ndir = dirOb.path;
    if(typeof npane === 'undefined') npane = localCurrentCursor.pane;
    if(typeof dirOb.cursor === 'undefined') dirOb.cursor = true;
    if(npane == 'left') {
      leftDir.set({path: ndir, fileSystemType: localLeftDir.fileSystemType, fileSystem: localLeftDir.fileSystem});
      leftEntries = localLeftDir.fileSystem.getDirList(ndir);
      if(leftEntries.length !== 0) {
        currentLeftFile.set({ entry: leftEntries[0]});
        if(dirOb.cursor) currentCursor.set({ entry: leftEntries[0], pane: npane});
      } else {
        currentLeftFile.set({ entry: {
          name: '',
          size: '',
          type: localLeftDir.fileSystemType,
          fileSystem: localLeftDir.fileSystem,
          dir: ndir,
          datetime: '',
          selected: false
        }});
        if(dirOb.cursor) {
          currentCursor.set({ entry: {
            name: '',
            size: '',
            type: localLeftDir.fileSystemType,
            fileSystem: localLeftDir.fileSystem,
            dir: ndir,
            datetime: '',
            selected: false
          }, pane: npane});
        }
      }
    } else {
      rightDir.set({path: ndir, fileSystemType: localRightDir.fileSystemType, fileSystem: localRightDir.fileSystem});
      rightEntries = localRightDir.fileSystem.getDirList(ndir);
      if(rightEntries.length !== 0) {
        currentRightFile.set({ entry: rightEntries[0]});
        if(dirOb.cursor) currentCursor.set({ entry: rightEntries[0], pane: npane});
      } else {
        currentRightFile.set({ entry: {
          name: '',
          size: '',
          type: localRightDir.fileSystemType,
          fileSystem: localRightDir.fileSystem,
          dir: ndir,
          datetime: '',
          selected: false
        }});
        if(dirOb.cursor) {
          currentCursor.set({ entry: {
            name: '',
            size: '',
            type: localRightDir.fileSystemType,
            fileSystem: localRightDir.fileSystem,
            dir: ndir,
            datetime: '',
            selected: false
          }, pane: npane});
        }
      }
    }
  }

  function openFile(entry) {
    entry.fileSystem.openFile(entry.dir, entry.name);
  }

  function actionEntry() {
    if(localCurrentCursor.entry.type === 0) {
      //
      // It is a file. Open it.
      //
      openFile(localCurrentCursor.entry);
    } else {
      //
      // It is a directory. Go down a level.
      //
      var ndir = localCurrentCursor.entry.fileSystem.appendPath(localCurrentCursor.entry.dir, localCurrentCursor.entry.name);
      changeDir({
        path: ndir,
        cursor: true
      }, localCurrentCursor.pane);
    }
  }
  
  function goUpDir() {
    var sep = localCurrentCursor.entry.fileSystem.pathSep();
    var parts = localCurrentCursor.entry.dir.split(sep);
    if(parts.length > 0) {
      var newDir = parts.slice(0,parts.length-1).join(sep);
      if(newDir == '') newDir = sep;
      changeDir({
        path: newDir,
        cursor: true 
      }, localCurrentCursor.pane);
      setCursor(parts[parts.length-1]);
    }
  }

  function goDownDir() {
    if(localCurrentCursor.entry.type === 1) {
      var newDir = localCurrentCursor.entry.fileSystem.appendPath(localCurrentCursor.entry.dir, localCurrentCursor.entry.name);
      changeDir({
        path: newDir,
        cursor: true 
      }, localCurrentCursor.pane);
    }
  }

  function goBottomFile() {
    if(localCurrentCursor.pane == 'left') {
      if(leftEntries.length !== 0) {
        const last = leftEntries[leftEntries.length - 1];
        setCursor(last.name);
      }
    } else {
      if(rightEntries.length !== 0) {
        const last = rightEntries[rightEntries.length - 1];
        setCursor(last.name);
      }
    }
  }

  function goTopFile() {
    if(localCurrentCursor.pane == 'left') {
      if(leftEntries.length !== 0) {
        var top = leftEntries[0];
        setCursor(top.name);
      }
    } else {
      if(rightEntries.length !== 0) {
        var top = rightEntries[0];
        setCursor(top.name);
      }
    }
  }

  function getCurrentFile() {
    return(localCurrentCursor.entry);
  }

  function getCurrentPane() {
    return(localCurrentCursor.pane);
  }

  function getLastError() {
    return(lastError);
  }

  function deleteEntries() {
    var entries = getSelectedFiles();
    var sel = true;
    if(entries.length === 0) {
      //
      // Get the entry at the current cursor
      //
      entries.push(localCurrentCursor.entry);
      sel = false;
    }
    msgBoxConfig = {
      title: "Deleting Entries",
      noShowButton: true
    };
    msgBoxItems = [];
    msgBoxItems.push({
        type: 'label',
        name: 'msgboxMain',
        for: 'progress1',
        text: 'Deleting ' + entries.length + ' Entries...'
      });
    msgBoxItems.push({
        type: 'spinner',
        name: 'progress1',
        value: 1
      });
    msgBoxItems = msgBoxItems;
    msgCallBack = (e) => { showMessageBox = false; };
    addSpinner('progress1', 1);
 
    entries.forEach((item, key, arr) => {
      item.fileSystem.deleteEntries(item, (err, stdout)=>{
        if(key >= (arr.length-1)) {
          showMessageBox = false;
          keyProcess.set(true);
          localKeyProcess = true;

          //
          // Refresh the side deleted from.
          //
          if(localCurrentCursor.pane === 'left') {
            refreshLeftPane();
          } else {
            refreshRightPane();
          }

          //
          // Remove the spinner from being checked.
          //
          removeSpinner('progress1');
        }
      });
      updateSpinner('progress1',((key+1)/entries.length)*100);
    });
   
    //
    // It is all set up. Show the message box.
    //
    showMessageBox = true;
  }

  function copyEntries() {
    var entries = getSelectedFiles();
    var sel = true;
    if(entries.length === 0) {
      //
      // Get the entry at the current cursor
      //
      entries.push(localCurrentCursor.entry);
      sel = false;
    }
    var otherPane = localCurrentCursor.pane === 'left' ? { ...localCurrentRightFile.entry } : { ...localCurrentLeftFile.entry };
    msgBoxConfig = {
      title: "Copying Entries",
      noShowButton: true
    };
    msgBoxItems = [];
    msgBoxItems.push({
        type: 'label',
        name: 'msgboxMain',
        for: 'progress1',
        text: 'Copying ' + entries.length + ' Entries...'
      });
    msgBoxItems.push({
        type: 'spinner',
        name: 'progress1',
        value: 1
      });
    msgBoxItems = msgBoxItems;
    msgCallBack = (e) => { showMessageBox = false; };
    addSpinner('progress1', 1);
 
    entries.forEach((item, key, arr) => {
      item.fileSystem.copyEntries(item, otherPane, false, (err, stdout)=>{
        if(key >= (arr.length-1)) {
          showMessageBox = false;
          keyProcess.set(true);
          localKeyProcess = true;

          //
          // Refresh the side copied to.
          //
          if(localCurrentCursor.pane === 'left') {
            refreshLeftPane();
          } else {
            refreshRightPane();
          }

          //
          // clear out the selections.
          //
          if(sel) clearSelectedFiles();

          //
          // Remove the spinner from being checked.
          //
          removeSpinner('progress1');
        }
      });
      updateSpinner('progress1',((key+1)/entries.length)*100);
    });
   
    //
    // It is all set up. Show the message box.
    //
    showMessageBox = true;
  }

  async function swapPanels() {
    var cfile = localCurrentCursor.entry.name;
    var npane = localCurrentCursor.pane === 'left' ? 'right' : 'left';
    tmp = localCurrentLeftFile;
    currentLeftFile.set(localCurrentRightFile);
    currentRightFile.set(tmp);
    tmp = localLeftDir;
    leftDir.set(localRightDir);
    rightDir.set(tmp);
    var tmp = rightEntries;
    rightEntries = leftEntries;
    leftEntries = tmp;
    tick();
    cursorToPane(npane);
  }

  function editEntry() {
    if(localFS.fileExists(userEditor)) {
      //
      // There is an editor defined by the user. Use it.
      //
      var file = localFS.appendPath(localCurrentCursor.entry.dir, localCurrentCursor.entry.name);
      var editor = localFS.readFile(userEditor).toString().trim();
      if(editor.endsWith('.app')) {
        localFS.openFileWithProgram(editor, file);
      } else {
        //
        // It is a command line editor. Open specially.
        //
        if(editor === 'emacs') {
          //
          // Open emacs.
          //
          localFS.runCommandLine(editor + ' "' + file + '"');
        } else {
          //
          // Open in a terminal program.
          //
          localFS.openInTerminal(editor, file);
        }
      }
    } else {
      //
      // Open with the system default editor.
      //
      openFile(localCurrentCursor.entry);
    }
  }

  function duplicateEntry() {
    var newName = '';
    if(localCurrentCursor.entry.name[0] === '.') {
      newName = localCurrentCursor.entry.name + '-copy';
    } else {
      newName = localCurrentCursor.entry.name.split('.');
      if(newName.length >= 2) {
        newName[newName.length - 2] = newName[newName.length - 2] + '-copy';
        newName = newName.join('.');
      } else {
        newName = localCurrentCursor.entry.name + "-copy";
      }
    }
    var nEntry = { ...localCurrentCursor.entry };
    nEntry.name = newName;
    localCurrentCursor.entry.fileSystem.copyEntries(localCurrentCursor.entry, nEntry, true);
    //
    // Refresh the file list.
    //
    if(localCurrentCursor.pane === 'left') {
      refreshLeftPane();
    } else {
      refreshRightPane();
    }
  }

  function moveEntries() {
    var entries = getSelectedFiles();
    var sel = true;
    if(entries.length === 0) {
      //
      // Get the entry at the current cursor
      //
      entries.push(localCurrentCursor.entry);
      sel = false;
    }
    var otherPane = localCurrentCursor.pane === 'left' ? localCurrentRightFile.entry : localCurrentLeftFile.entry;
    msgBoxConfig = {
      title: "Moving Entries",
      noShowButton: true
    };
    msgBoxItems = [];
    msgBoxItems.push({
        type: 'label',
        name: 'msgboxMain',
        for: 'progress1',
        text: 'Moving ' + entries.length + ' Entries...'
      });
    msgBoxItems.push({
        type: 'spinner',
        name: 'progress1',
        value: 1
      });
    msgBoxItems = msgBoxItems;
    msgCallBack = (e) => { showMessageBox = false; };
    addSpinner('progress1', 1);
 
    entries.forEach((item, key, arr) => {
      item.fileSystem.moveEntries(item, otherPane, (err, stdout)=>{
        if(key >= (arr.length-1)) {
          showMessageBox = false;
          keyProcess.set(true);
          localKeyProcess = true;

          //
          // Refresh both sides.
          //
          refreshPanes();

          //
          // clear out the selections.
          //
          if(sel) clearSelectedFiles();

          //
          // Remove the spinner from being checked.
          //
          removeSpinner('progress1');
        }
      });
      updateSpinner('progress1',((key+1)/entries.length)*100);
    });
   
    //
    // It is all set up. Show the message box.
    //
    showMessageBox = true;
  }

  function refreshRightPane() {
    //
    // Refresh right pane.
    //
    rightEntries = localRightDir.fileSystem.getDirList(localRightDir.path);
    var current = rightEntries[0];
    if(rightEntries.length == 0) {
      current = {
        name: '',
        dir: currentRightFile.entry.dir,
        fileSystemType: currentRightFile.entry.fileSystemType,
        fileSystem: currentRightFile.entry.fileSystem,
        selected: false,
        datetime: '',
        type: 0,
        size: 0,
        stats: null
      };
    }
    if(localCurrentCursor.pane == 'right') {
      currentCursor.set({
        entry: current,
        pane: 'right'
      });
      currentRightFile.set({
        entry: current
      });
    }
  }

  function refreshLeftPane() {
    //
    // Refresh left pane.
    //
    leftEntries = localLeftDir.fileSystem.getDirList(localLeftDir.path);
    var current = leftEntries[0];
    if(leftEntries.length === 0) {
      current = {
        name: '',
        dir: currentRightFile.entry.dir,
        fileSystemType: currentLeftFile.entry.fileSystemType,
        fileSystem: currentLeftFile.entry.fileSystem,
        selected: false,
        datetime: '',
        type: 0,
        size: 0,
        stats: null
      };
    }
    if(localCurrentCursor.pane == 'left') {
      currentCursor.set({
        entry: current,
        pane: 'left'
      });
      currentLeftFile.set({
        entry: current
      });
    }
  }

  function refreshPanes() {
    refreshLeftPane();
    refreshRightPane();
  }

  function showMessage(title, msg) {
    msgBoxConfig = {
      title: title,
      noShowButton: false
    };
    msgBoxItems = [{
      type: 'label',
      for: 'msgboxMain',
      text: msg,
      id: 'msgboxMain'
    }];
    showMessageBox = true;
    msgCallBack = (e) => {};
  }

  function pickItem(title, items, returnValue) {
    msgBoxConfig = {
      title: title,
      noShowButton: false
    };
    msgBoxItems = [{
      type: 'picker',
      selections: items,
      value: items[0].value,
      id: 'msgboxMain'
    }];
    showMessageBox = true;
    msgCallBack = (e) => {
      returnValue(e[0].value);
      msgCallBack = (e) => {};
    };
  }

  function askQuestion(title, question, returnValue) {
    msgBoxConfig = {
      title: title,
      noShowButton: false
    };
    msgBoxItems = [{
      type: 'input',
      msg: question,
      value: '',
      id: 'msgboxMain'
    }];
    showMessageBox = true;
    msgCallBack = (e) => {
      returnValue(e[0].value);
      msgCallBack = (e) => {};
    }
  }

  function newFile() {
    msgBoxConfig = {
      title: "New File Name",
      noShowButton: false
    };
    msgBoxItems = [{
      type: 'input',
      msg: 'What name do you want to give the new file?',
      value: '',
      id: 'msgboxMain'
    }];
    showMessageBox = true;
    msgCallBack = newFileReturn;
  }

  function newFileReturn(data) {
    //
    // Setup a null callback.
    //
    msgCallBack = (e) => {};
    var nfname = data[0].value;

    //
    // Create the new file.
    //
    var nfile = { ...localCurrentCursor.entry };
    nfile.name = nfname;
    localCurrentCursor.entry.fileSystem.createFile(nfile);

    //
    // Refresh the file list.
    //
    if(localCurrentCursor.pane === 'left') {
      refreshLeftPane();
    } else {
      refreshRightPane();
    }
    
    //
    // Set the new file as the cursor point.
    //
    setCursor(nfname);
  }

  function newDirectory() {
    msgBoxConfig = {
      title: "New Directory Name",
      noShowButton: false
    };
    msgBoxItems = [{
      type: 'input',
      msg: 'What name do you want to give the new directory?',
      value: '',
      id: 'msgboxMain'
    }]

    showMessageBox = true;
    msgCallBack = newDirectoryReturn;
  }

  function newDirectoryReturn(data) {
    //
    // Setup a null callback.
    //
    msgCallBack = (e) => {};
    var ndname = data[0].value;

    //
    // Create the new file.
    //
    var ndir = { ...localCurrentCursor.entry };
    ndir.name = ndname;
    localCurrentCursor.entry.fileSystem.createDir(ndir);

    //
    // Refresh the file list.
    //
    if(localCurrentCursor.pane === 'left') {
      refreshLeftPane();
    } else {
      refreshRightPane();
    }
    
    //
    // Set the new file as the cursor point.
    //
    setCursor(ndname);
  }

  function renameEntry() {
    msgBoxConfig = {
      title: "Rename File or Directory",
      noShowButton: false
    };
    msgBoxItems = [{
      type: 'input',
      msg: 'What name do you want to change to?',
      value: localCurrentCursor.entry.name,
      id: 'msgboxMain'
    }];
    showMessageBox = true;
    msgCallBack = renameReturn;
  }

  function renameReturn(data) {
    //
    // Setup a null callback.
    //
    msgCallBack = (e) => {};
    var nname = data[0].value;

    //
    // Create the new file.
    //
    var nentry = { ...localCurrentCursor.entry };
    nentry.name = nname;
    localCurrentCursor.entry.fileSystem.renameEntry(localCurrentCursor.entry, nentry);

    //
    // Refresh the file list.
    //
    if(localCurrentCursor.pane === 'left') {
      refreshLeftPane();
    } else {
      refreshRightPane();
    }
    
    //
    // Set the new file as the cursor point.
    //
    setCursor(nname);
  }

  function clearSelectedFiles() {
    if(localCurrentCursor.pane == 'left') {
      //
      // Clear the left pane's selected files
      //
      leftEntries = leftEntries.map(item => {
        item.selected = false;
        return item;
      });
    } else {
      //
      // Clear the right panes selected files
      //
      rightEntries = rightEntries.map(item => {
        item.selected = false;
        return item;
      });
    }
  }

  function getSelectedFiles() {
    var selected = [];
    if(localCurrentCursor.pane == 'left') {
      //
      // Get the left pane's selected files
      //
      selected = leftEntries.filter(item => item.selected === true);
    } else {
      //
      // Get the right panes selected files
      //
      selected = rightEntries.filter(item => item.selected === true);
    }
    return(selected);
  }

  function msgReturn(e) {
    showMessageBox = false;
    msgCallBack(e.detail.ans);
  }

  function toggleQuickSearch() {
    showQuickSearch = !showQuickSearch;
  }

  function qsChangeEntries(e) {
    if(e.detail.pane === 'left') {
      leftEntries = e.detail.entries;
    } else {
      rightEntries = e.detail.entries;
    }
    if(localCurrentCursor.pane == 'left') {
      currentCursor.set({
        entry: leftEntries[0],
        pane: 'left'
      });
      currentLeftFile.set({
        entry: leftEntries[0]
      });
    } else {
      currentCursor.set({
        entry: rightEntries[0],
        pane: 'right'
      });
      currentRightFile.set({
        entry: rightEntries[0]
      });
    }
  }

  function getCursor() {
    return(localCurrentCursor);
  }

  function getLeftFile() {
    return(localCurrentLeftFile);
  }

  function getRightFile() {
    return(localCurrentRightFile);
  }

  function editDirLoc() {
    if(localCurrentCursor.pane === 'left') {
      setEditDirFlagLeft = true;
    } else {
      setEditDirFlagRight = true;
    }
  }

  function toggleExtraPanel() {
    showExtra = !showExtra;
  }

  function addKeyboardShort(keyboard, ctrl, shift, meta, key, cmd) {
    stateMaps[keyboard].push({
      ctrl: ctrl,
      shift: shift,
      meta: meta,
      key: key,
      command: cmd
    });
  }

  function setTheme(thm) {
    theme.set(thm);
  }

  function getTheme() {
    return(localTheme);
  }

  function addDirectoryListener(listener) {
    localDirListeners.push(listener);
    directoryListeners.set(localDirListeners);
  }

  function toggleCommandPrompt() {
    showCommandPrompt = !showCommandPrompt;
  }

  function addSpinner(name, value) {
    msgBoxSpinners.push({
      name: name,
      value: value
    });
    msgBoxSpinners = msgBoxSpinners;
  }

  function updateSpinner(name, value) {
    msgBoxSpinners = msgBoxSpinners.map(spinner => {
      if(spinner.name === name) {
        spinner.value = value;
      }
      return(spinner);
    });
  }

  function removeSpinner(name) {
    msgBoxSpinners = msgBoxSpinners.filter(spinner => spinner.name !== name);
  }

  function toggleGitHub() {
    showGitHub = !showGitHub;
    if(showGitHub) {
      keyProcess.set(false);
      localKeyProcess = false;
    } else {
      keyProcess.set(true);
      localKeyProcess = true;
    }
  }

  function setShowAllFilter() {
    flagFilter = 0;
    localFS.setFilter(localFS.allFilter);
    refreshPanes();
  }

  function setDefaultFilter() {
    flagFilter = 1;
    localFS.setFilter(localFS.defaultFilter);
    refreshPanes();
  }

  function toggleFilter() {
    switch(flagFilter) {
      case 0:
        setDefaultFilter();
        break;
      case 1:
        setShowAllFilter();
        break;
      default:
        setDefaultFilter();
        break;
    }
  }

  function createDefaultNormalMap(keyMapDir) {
    // 
    // There are no key map files. We need to create them.
    // 
    let defaultNormalMap = [{
      ctrl: false,
      shift: true,
      meta: false,
      key: ':',
      command: "toggleCommandPrompt"
    },{
      ctrl: true,
      shift: false,
      meta: false,
      key: 'p',
      command: "toggleCommandPrompt"
    },{
      ctrl: false,
      shift: false,
      meta: false,
      key: 's',
      command: "toggleExtraPanel"
    },{
      ctrl: false,
      shift: false,
      meta: false,
      key: 'q',
      command: "editDirLoc"
    },{
      ctrl: false,
      shift: false,
      meta: false,
      key: 'r',
      command: "reloadPane"
    },{
      ctrl: false,
      shift: false,
      meta: false,
      key: 'p',
      command: "swapPanels"
    },{
      ctrl: false,
      shift: false,
      meta: false,
      key: 'd',
      command: "duplicateEntry"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'e',
      command: "editEntry"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'm',
      command: "moveEntries"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'c',
      command: "copyEntries"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'x',
      command: "deleteEntries"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'g',
      command: "goTopFile"
    }, {
      ctrl: false,
      shift: true,
      meta: false,
      key: 'G',
      command: "goBottomFile"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'ArrowDown',
      command: "moveCursorDown"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'ArrowUp',
      command: "moveCursorUp"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'l',
      command: "goDownDir"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'h',
      command: "goUpDir"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'Enter',
      command: "actionEntry"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'Tab',
      command: "cursorToNextPane"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'k',
      command: "moveCursorUp"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'j',
      command: "moveCursorDown"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'i',
      command: "changeModeInsert"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: 'v',
      command: "changeModeVisual"
    }, {    
      ctrl: false,
      shift: false,
      meta: false,
      key: '/',
      command: "toggleQuickSearch"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: '.',
      command: "reRunLastCommand"
    }, {
      ctrl: false,
      shift: false,
      meta: false,
      key: ',',
      command: "toggleFilter"
    }, {
      ctrl: false,
      shift: true,
      meta: false,
      key: 'O',
      command: "openOppositePanel"
    }];
    
    // 
    // Create the directory for the keymaps if it doesn't exist.
    //
    if(!localFS.dirExists(keyMapDir)) localFS.createDir(keyMapDir);

    //
    // Create the default files if they don't exist.
    //
    localFS.writeFile(localFS.appendPath(keyMapDir, 'normalKeyMap.json'), JSON.stringify(defaultNormalMap));
    
    // 
    // Set the proper commands.
    //
    stateMaps['normal'] = processKeyMap(defaultNormalMap);
  }

  function createDefaultVisualMap(keyMapDir) {
    let defaultVisualMap = [{
        ctrl: false,
      shift: true,
      meta: false,
      key: ':',
      command: "toggleCommandPrompt"
    },{
        ctrl: false,
      shift: false,
      meta: false,
      key: 'k',
      command: "moveCursorUpWithSelect"
    }, {
        ctrl: false,
      shift: false,
      meta: false,
      key: 'j',
      command: "moveCursorDownWithSelect"
    }, {
        ctrl: false,
      shift: false,
      meta: false,
      key: 'ArrowDown',
      command: "moveCursorDown"
    }, {
        ctrl: false,
      shift: false,
      meta: false,
      key: 'ArrowUp',
      command: "moveCursorUp"
    }, {    
      ctrl: false,
      shift: false,
      meta: false,
      key: 'Escape',
      command: "changeModeNormal"
    }];
    
    // 
    // Create the directory for the keymaps if it doesn't exist.
    //
    if(!localFS.dirExists(keyMapDir)) localFS.createDir(keyMapDir);

    //
    // Create the default files if they don't exist.
    //
    localFS.writeFile(localFS.appendPath(keyMapDir, 'visualKeyMap.json'), JSON.stringify(defaultVisualMap));
    
    // 
    // Set the proper commands.
    //
    stateMaps['visual'] = processKeyMap(defaultVisualMap);
  }
  
  function createDefaultInsertMap(keyMapDir) {
    let defaultInsertMap = [{
        ctrl: false,
      shift: true,
      meta: false,
      key: ':',
      command: "toggleCommandPrompt"
    },{    
      ctrl: false,
      shift: false,
      meta: false,
      key: 'Escape',
      command: "changeModeNormal"
    }, {    
      ctrl: false,
      shift: false,
      meta: false,
      key: 'd',
      command: "newDirectory"
    }, {    
      ctrl: false,
      shift: false,
      meta: false,
      key: 'f',
      command: "newFile"
    }, {    
      ctrl: false,
      shift: false,
      meta: false,
      key: 'r',
      command: "renameEntry"
    }];

    // 
    // Create the directory for the keymaps if it doesn't exist.
    //
    if(!localFS.dirExists(keyMapDir)) localFS.createDir(keyMapDir);

    //
    // Create the default files if they don't exist.
    //
    localFS.writeFile(localFS.appendPath(keyMapDir, 'insertKeyMap.json'), JSON.stringify(defaultInsertMap));
    
    // 
    // Set the proper commands.
    //
    stateMaps['insert'] = processKeyMap(defaultInsertMap);
  }

  function loadKeyMaps() {
    //
    // Load key maps from the config directory.
    //
    var keyMapDir = { ...localCurrentCursor.entry };
    keyMapDir.dir = configDir;
    keyMapDir.name = 'keyMaps';

    if(!localFS.dirExists(keyMapDir)) {
      createDefaultNormalMap(keyMapDir);
      createDefaultVisualMap(keyMapDir);
      createDefaultInsertMap(keyMapDir);
    } else {
      // 
      // The keymap directory is there. let's load the files.
      // 
      var fileLoc = localFS.appendPath(keyMapDir, 'normalKeyMap.json');
      if(!localFS.fileExists(fileLoc)) {
        createDefaultNormalMap(keyMapDir);
      }
      stateMaps['normal'] = processKeyMap(JSON.parse(localFS.readFile(fileLoc)));

      fileLoc = localFS.appendPath(keyMapDir, 'visualKeyMap.json')
      if(!localFS.fileExists(fileLoc)) {
        createDefaultVisualMap(keyMapDir);
      }
      stateMaps['visual'] = processKeyMap(JSON.parse(localFS.readFile(fileLoc)));
      
      fileLoc = localFS.appendPath(keyMapDir, 'insertKeyMap.json');
      if(!localFS.fileExists(fileLoc)) {
        createDefaultInsertMap(keyMapDir);
      }
      stateMaps['insert'] = processKeyMap(JSON.parse(localFS.readFile(fileLoc)));
    }
  }

  function processKeyMap(kmap) {
    return kmap.map((item, index, arr) => {
      var cmd = commands.getCommand(item.command);
      if(typeof cmd === 'undefined') {
        cmd = commands.getAltCommand(item.command);
      }
      if(typeof cmd !== 'undefined') {
        // 
        // Found the command. Set it up.
        //
        item.name = item.command;
        item.command = cmd.command;
        return(item);
      } else {
        // 
        // If the command can't be found, remove it from the map.
        //
        delete arr[index];
      }
    });
  }
</script>

