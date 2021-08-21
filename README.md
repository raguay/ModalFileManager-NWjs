![ModalFileManager](https://socialify.git.ci/raguay/ModalFileManager/image?description=1&descriptionEditable=A%20web%20technology%20based%20file%20manager%20built%20with%20NW.js%2C%20Svelte%2C%20and%20Node.js.%20It%27s%20keyboard%20command%20layout%20is%20taken%20from%20Vim.&forks=1&issues=1&language=1&owner=1&pattern=Floating%20Cogs&pulls=1&stargazers=1&theme=Light)

[![Richard's GitHub stats](https://github-readme-stats.vercel.app/api?username=raguay)](https://github.com/anuraghazra/github-readme-stats)

This project is for creating a file manager using web technologies. It is designed to run as a NW.js application. Node.js is the main language used with Svelte for the frontend UI.

Currently, it can`t transfer files to other programs with Drag and Drop due to a limitation of the NW.js program that is based on the Chrome browser. I should be able to get past this limitation soon by using lower level commands to the operating system.

This file manager is designed around the same principle as Vim: a state controled keyboard actions. The number of states isn't fixed, but very programmable. Therefore, an infinite number of keyboard configurations can be created and used. This is the main difference from other file managers.

# Disclamer:  Beta level software. Use at your own risk! I accept no liability for lost information from the use of this software. User beware! But, if you have a major problem, please let me know so that I can look for solutions. This file manager is built using command line commands (rm, cp, mv, etc). Deletions currently default to moving to the trashcan on new installations.

The low level interface is still being mapped out and changes are happening. This means that extensions made using the current API will most likely need changes as the project moves forward. 

## Table of Contents

- [Philosophy](#philosophy)
- [Current Feature Set](#current-feature-set)
- [Some Limitations](#some-limitations)
- [Installation](#installation)
- [Upgrading](#upgrading)
- [Command Line Programs Used](#command-line-programs-used)
- [Configuration Files](#configuration-files)
- [Source File Layout](#source-file-layout)
- [Editing Files](#editing-files)
- [Preferences](#preferences)
- [Things in the Works](#things-in-the-works)
- [Default Key Bindings](#default-key-bindings)
  - [Normal Mode](#normal-mode)
  - [Visual Mode](#visual-mode)
  - [Insert Mode](#insert-mode)
- [Command Prompt Commands](#command-prompt-commands)
- [Extension Commands](#extension-commands)
- [Creating Themes](#creating-themes)
- [Creating Extensions](#creating-extensions)
- [Tutorials on Modal File Manager](#tutorials-on-modal-file-manager)
- [Adding Video Preview on Extra Panel](#adding-video-preview-on-extra-panel)
- [Icon](#icon)

## Philosophy

I started my programming career with Emacs as my main text editor on a main frame computer in college. I really loved Emacs, but had a very hard time remembering all the key commands.  I ended up using Vim once for a class I had (the teacher loved Vim) and hit the perverbial Vim wall -- How do I exit this thing! I finally had to kill the process. So, I went back to Emacs.

With Spacemacs and Doom-emacs, I learned that the Vim style keyboard was much more efficient. But, I kept going back to the Emacs key memory. I finally decided to really give Vim a run with neovim on my MacBook Air. I even installed Spacevim and really liked it. Now, I'm fully comfortable in the Vim style keyboard (but far from mastering it completely) and have adapted it to many other programs along the way. My current editor of choice is [OniVim2](https://github.com/onivim/oni2) which is the fastest programming editor I've ever used. It is great!

But, I've never been happy with the file managers I've used. [fman](https://fman.io/) is great, but not actively being maintained and expanded upon. I also don't really like python, it's API language. So, I decided to jump in and make one to suit me better. This is how Modal File Manager was started. I wanted something that was as configurable as TkDesk was, but with a modal keyboard model for hotkeys. To take it even further, new modes and keymaps can be added with extensions. Along with anything else you can do with a full Node.js backend.

Modal File Manager is also somewhat minimal in the UI. Many graphical file managers have buttons, shelves, etc. all over the place with information everywhere. I decided to make the main interface as low keyed as possible with all other information in the status line or extras panel. Extra file information is on the status line for the current cursor location. More information is displayed in extras panel as well.

Since there are so many dual pane file managers available, I knew this would never be a marketable product (and I did not want the hassle of endless customer complaint over a feature not working the way they want it). Therefore, I'm making this an open source project to hopefully get some help from other to really making this thing shine.

Therefore, I hope you enjoy this little program as much as I have. Feel free to sponsor the project, help code some of it (just send in the pull requests), or just give me some tips along the way. Any help is appreciated.

I've created multiple open source resources (I have around 80 GitHub repositories), but this is the first full product. Therefore, please bear with me as I learn about maintaining and supporting an open source project.  

## Current Feature Set

- Dual pane file manager with vim style model hotkeys for navigation and action launching.
- Drag and Drop works for copying or moving the current cursor and all selected files or directories (the current cursor location) within the application itself. If no keys pressed, it will be copied. If shift key is pressed, it will be moved. The drag begins with the current cursor.
- Command Prompt for executing commands (`:` in any mode or `<ctrl>p` in normal mode).
- Fully extendable with extensions using the extensions API
- Fully theme-able. 
- A file details side panel can be shown to overlay the panel not currently focused (`toggleExtraPanel` command). It shows video previews and stats with the ffmpeg programs installed. Extensions can place special content in this panel as well.
- Themes and extensions are explorable and downloadable from GitHub inside the program.
- Hot keys are programmable
- A number before a hot key runs it's associated command that many times (ex: `5j` will move the cursor 5 entries down the list).
- Watches for changes in the current directory and updates accordingly.
- Changing directories in the Directory Bar (normal mode `q`) shows a list of matching entries from history and then below the current directory.
- File editor is configurable by the `~/.myeditorchoice` file (see `Editing Files` below). Otherwise, the system editor for the file type will be used.
- Integrated with ScriptPad - another project of mine coming soon!
- Quick Search - a input to type text so that any entry at that level is removed that doesn't have that text in it. Just refresh the pane to get back to normal. I think of it as a quick filter more than a quic search.
- Toggle System files/folders visibility
- Optionally deletes to the OS's trashcan (external program has to be installed)
- Change the environment used to execute external programs using the `Show Preferences` Command Prompt command.
- Theme Creator/Editor
- Extension Creator/Editor with template.
- Extensions controled content in the Extras Panel.
- Extensions currently created and downloadable from GitHub:
  - [Copy to Clipboard](https://github.com/raguay/CopyToClipboard-ModalFileManagerExtension): copy file name or path to clipboard with command prompt.
  - [Alfred](https://github.com/raguay/Alfred-ModalFileManager): Launch Afred Browser on the current cursor location
  - [Move to Dir](https://github.com/raguay/moveToDir-ModalFileManagerExtension): Selected files are moved to the folder under the cursor in the same panel
  - [iTerm](https://github.com/raguay/iTerm-ModalFileManagerExtension): open the current cursor directory in iTerm2
  - [Favorites](https://github.com/raguay/Favorites-ModalFileManagerExtension): An extension to mark favorite directories to be able to go back to easily, back up directories previously entered, six directory registers to quickly hop around using the `fav` mode, and much more.
  - [User Scripts](https://github.com/raguay/runScripts-ModalFileManagerExtension): Create and run scripts from mfm.
  - [Project Manager](https://github.com/raguay/ProjectManager-mfm): A set of functions to work with projects, project templates, run project scripts for npm and mask, and creating/editing of project notes.
- Themes currently created and downloadable from GitHub:
  - [Dracula Pro](https://github.com/raguay/dracula-ThemeModalFileManager)
  - [Dracula "Buffy"](https://github.com/raguay/dracula-buffy-ThemeModalFileManager)
  - [Dracula "Van Helsing"](https://github.com/raguay/Dracula-Van-Helsing-ThemeModalFileManager)

All Dracula based themes are here with permission from the author. Please support his great work at [Dracula Themes](https://draculatheme.com/). The Dracula "Buffy" theme is my preferred theme for everything. I'm having many issues with my eyes having light sensitivity and this theme allows me to keep working longer than other themes.

## Some Limitations

Because this is a web technologies application, there are certain things that it just can't do and I'm not sure if they can be done at this level. Therefore, this will not completely remove your dependency on using the Finder application. But, these instances are not everyday items for which we use a file manager. As I see it, these items are not doable, but I would love for someone to prove me wrong:

- Install applications that the macOS Gatekeeper will allow.

## Installation

These directions currently work for the macOS. I haven't tested the Linux or Windows installation. All external programs should be installed before first running the Modal File Manager. Otherwise, you will have to modify the path used to execute external programs to find them.

I have a run script made with [Mask](https://github.com/jakedeichert/mask) and [Node.js](https://nodejs.org/en/). You have to put a copy of [NW.js](https://nwjs.io/) in the 'misc' directory as `nwjs.app`. Or, you can change the script. I'm assuming you aren't changing the script in the following. Also, the scripts in the mask file are running in a [fish shell](https://github.com/fish-shell/fish-shell). If you don't have fish shell on your system, you will need to either install it or convert the script to run in zsh or sh.

So, download the repository, create the `misc` directory, put nwjs.app in the `misc` directory. On the command line, run the following commands to compile and run the program:

```sh 
git clone https://github.com/raguay/ModalFileManager.git 
cd ModalFileManager
mkdir misc
npm install 
``` 

This will install all the libraries for building the project. Then run:

```sh 
mask build
```

which will build the project. To run the project, run this command:

```sh 
mask launch
``` 

If everything is in place okay, it should then show you the file manager opened to your home directory. Dive in and have fun.

If you are interested in running in development mode, you have to have the NW.js SDK in the `misc` directory named `nwjs-sdk`. Then you can run:

```sh 
mask launch -d
``` 

which will launch the sdk version of NW.js with full development tools.

If you just want to download a program to use, check the releases. I'm currently releasing beta level macOS binaries in the releases. A step by step installing using the releases is discussed in my tutorial [Modal File Manager: Update and Extensions](https://blog.customct.com/modal-file-manager-update-and-extensions). This version isn't complete in that when you run a program to view processes, the processes will say `nwjs`, but the icon will be for mfm (Modal File Manager).

## Upgrading

If a new version comes out with new default key mappings, you will either have to manually alter the key maps or delete the `keyMaps` directory in the Modal File Manager configuration directory.

## Command Line Programs Used

There are a few non-standard command line programs I use with Modal File Manager. They are:

- [ffmpeg](https://ffmpeg.org/) for getting and using video information in the Extra Panel.
- [fd](https://github.com/sharkdp/fd) for quick file finding. It's a `find` replacement written in Rust.
- For using the macOS trashcan, you have to have (`trash`)[https://github.com/andreafrancia/trash-cli] command line program installed using `brew install trash-cli`. If the program isn't installed before installing mfm, then you will need to adjust the environment variable for PATH in the preferences to make sure it is in the path.

I also use the standard `cp`, `mv`, `mkdir`, and `rm` commands on the command line. These still run faster than rewriting them in the scripting language. The major drawback is there isn't a backup method. Once deleted with `rm`, it will always be deleted. The `rm` command is used only if the user sets the `Trashcan` general preference to off (unchecked). On a new install, this is usually set to on (checked) even if the `trash-cli` isn't installed. In that case, nothing get deleted. This is for safety of the user files and directories.

All of the programs should be downloaded and in your shell's path. Modal File Manager doesn't assume location for anything except or it's own configuration files. But, if Modal File Manager can't find the program, you can adjust the path used in the preferences general tab (Command Prompt command is `Show Preferences`).

## Configuration Files

All extensions, themes, keyboard layouts, and anything else for configuring the Modal File Manager is found in it's main configuration directory. On Linux and macOS, it is located at: `~/.config/modalfilemanager`. It will be in the Windows User directory, but I haven't really looked at Windows functionality yet.

In this configuration directory, there are the `themes`, `extensions`, and `keyMaps` directories that contain their respective subfolders and files. Please refer the specific section for each directory for more details.

There is the `history.json` file, `config.json` file, and the `theme.json` files in the configuration directory. Also, extensions will create and store their configuration files in this directory as well (at least, that is what I advise extension authors).

The `history.json` file contains a list of directories that the Modal File Manager has visited. I use this to quickly pull up possible paths to go to in the file manager. 

The `config.json` file contains the environment variables used to launch command line commands and whether or not to use the `trash-cli` program to delete files and directories.

Modal File Manager doesn't use the actual theme files downloaded from GitHub. Those are stored in the `themes` directory and are just referenced. All actually used theming is in the `theme.json` file. When a user changes themes, that file is changed. Therefore, be careful if you manually change this file and want to keep it. It is best to create a theme in the theme directory and load it in the program. My tutorial [Modal File Manager: Update and Extensions](https://blog.customct.com/modal-file-manager-update-and-extensions) walks through creating a theme using the Preferences Panel.

All configuration files should be edited from the `Show Preferences` command prompt command.

## Source File Layout

The directory structure is:

```
- modalfilemanager
  |
  - src 
    |
    - components                  Here are all the Svelte components for the UI
    - modules                     These are JavaScript Helper files with the data structures used.
    - stores                      This directory contains all the Svelte Store items
    - FileManager.svelte          This is the main program
    - main.js                     This installs the main program into the HTML
```

All low level functions are in the `modules/macOS.js`, `modules/linux.js`, and `modules/windows.js` for the particular operating system. This is the initial breakdown and will be added upon in the future as needed.

## Editing files

Files will be edited (normal mode key `e`) using editor specified in the [xBar](https://xbarapp.com/) plugin [currentFiles.1h.rb](https://xbarapp.com/plugins/System/currentFiles.1h.rb).

To use with the **xBar** plugin, you will need to have [xBar](https://xbarapp.com/) installed and the [currentFiles.1h.rb](https://xbarapp.com/docs/plugins/System/currentFiles.1h.rb.html) plugin installed and configured. You can also use the [Alfred BitBar Workflow](https://github.com/raguay/MyAlfred/blob/master/Alfred%203/BitBarWorkflow.alfredworkflow) to control the plugin.

Alternatively, you can use the [TextBar](http://richsomerfield.com/apps/textbar/) program with the [Current Files and Editor](https://github.com/raguay/TextBarScripts/blob/master/Current%20Files%20and%20Editor.textbar) plugin installed. You can use the [Alfred](https://www.alfredapp.com/) with the [My Editor Workflow](https://github.com/raguay/MyAlfred/blob/master/Alfred%203/My%20Editor%20Workflow.alfredworkflow) to control the editor and edit files.

If the above editor setup isn't on the system, it will use the operating system to open the 
file in the default file editor.

## Preferences

With the command prompt command of `Show Preferences`, you can now open a new panel over the filemanager that shows all the program preferences. It is setup as a tab system with a General, Theme, and Extension tab.

The General tab allows the user to delete, edit, or add environment variables to the running of command line programs. This give the user complete control over the environment variables used in launching commands from Modal File Manager. You can also turn on/off the use of the trashcan for deletions.

The Theme tab allows you to create, update, and delete themes from the Modal File Manager. My tutorial [Modal File Manager: Update and Extensions](https://blog.customct.com/modal-file-manager-update-and-extensions) walks through creating a theme using the Preferences Panel.

The Extension tab allows you to create, edit, and delete extensions from the Modal File Manager. The creation and editing of an extension will open the main file for the extension in the code editor that has been setup and moves the Modal File Manager to the extension's directory in the pane opposite the current cursor.

## Things in the Works

- Translating my fman extensions to work with Modal File Manager
	- Dropbox File System
	- Regular Expression selection
	- Zip Selected Entries
- Drag and drop with external programs 
- Add more file views for the Extra Panel
- Multiple windows
- Get Windows working
- Get Linux tested and working
- Get audio listening in the Extras Panel.
- Documentation!
- Of course, bug fixing!

## Default Key Bindings

### Normal Mode

| Key Press | Command Executed |
| --- | ------ |
| `r` | reloadPane |
| `p` | swapPanels |
| `d` | duplicateEntry |
| `e` | editEntry |
| `m` | moveEntries |
| `c` | copyEntries |
| `x` | deleteEntries |
| `g` | goTopFile |
| `G` | goBottomFile |
| `ArrowDown` | moveCursorDown |
| `ArrowUp` | moveCursorUp |
| `l` | goDownDir |
| `h` | goUpDir |
| `Enter` | actionEntry |
| `Tab` | cursorToNextPane |
| `k` | moveCursorUp |
| `j` | moveCursorDown |
| `i` | changeModeInsert |
| `v` | changeModeVisual |
| `/` | toggleQuickSearch |
| `s` | toggleExtraPanel |
| `<cmd>p` | toggleCommandPrompt |
| `:` | toggleCommandPrompt |
| `.` | reRunLastCommand |
| `,` | toggleFilter |
| `O` | openOppositePanel |

### Visual Mode

| Key Press | Command Executed |
| --- | ------ |
| `Escape` | changeModeNormal |
| `k` | moveCursorUpWithSelect |
| `j` | moveCursorDownWithSelect |
| `ArrowDown` | moveCursorDown |
| `ArrowUp` | moveCursorUp |
| `:` | toggleCommandPrompt |

### Insert Mode

| Key Press | Command Executed |
| --- | ------ |
| `Escape` | changeModeNormal |
| `d` | newDirectory |
| `f` | newFile |
| `r` | renameEntry |
| `:` | toggleCommandPrompt |


## Command Prompt Commands

These commands can be ran from the command prompt. They all act upon the current cursor.

| Command Name                      | Command Description                                                        | Command Function Name    | 
|:--------------------------------- |:-------------------------------------------------------------------------- | ------------------------ | 
| `Move Cursor Up`                  | This will move the cursor up one line                                    | moveCursorUp             |
| `Move Cursor Up with Selection`   | This will move select the current entry and move the cursor up one line. | moveCursorUpWithSelect   |     |
| `Change Mode to Normal`           | Set the normal mode.                                                     | changeModeNormal         |     |
| `Change Mode to Insert`           | Set the insert mode.                                                     | changeModeInsert         |     |
| `Change Mode to Visual`           | Set the visual mode.                                                     | changeModeVisual         |     |
| `Cursor to Next Pane`             | This will move the cursore to the opposite pane.                         | cursorToNextPane         |     |
| `Action Entry`                    | This will open a file or go into a directory.                            | actionEntry              |     |
| `Go Up a Directory`               | Go to the parent directory.                                              | goUpDir                  |     |
| `God Down a Directory`            | If the current entry is a directory go to it.                            | goDownDir                |     |
| `Go to Bottom File`               | Move the cursor to the bottom most file.                                 | goBottomFile             |     |
| `Go to Top File`                  | Move the cursor to the top most file.                                    | goTopFile                |     |
| `Delete Entries`                  | Delete all selected entries or the one under the cursor                  | deleteEntries            |     |
| `Copy Entries`                    | Copy the selected entries or the one under the cursor to the other pane. | copyEntries              |     |
| `Move Entries`                    | Move the selected entries or the one under the cursor to the other pane. | moveEntries              |     |
| `Edit Entry`                      | Opens the file under the cursor in the editor specified.                 | editEntry                |     |
| `Duplicate Entry`                 | Make a copy of the current entry with "\_copy" added to it.              | duplicateEntry           |     |
| `New File`                        | Create a new file in the current pane.                                   | newFile                  |     |
| `New Directory`                   | Create a new directory in the current pane.                              | newDirectory             |     |
| `Rename Entry`                    | Rename the current entry.                                                | renameEntry              |     |
| `Swap Panels`                     | Swap the panel contents.                                                 | swapPanels               |     |
| `Toggle Quick Search`             | Show/Hide the Quick Search panel.                                        | toggleQuickSearch        |     |
| `Reload Pane`                     | Reload the Current Pane.                                                 | reloadPane               |     |
| `Toggle Extra Panel`          | Show/Hide the extra panel. | toggleExtraPanel |
| `Edit Directory` | Open the Edit Directory for the current panel.| editDirectory |
| `Toggle Command Prompt` | Show/Hide the command prompt. | toggleCommandPrompt |
| `Toggle GitHub Importer` | Show/Hide the GitHub importer panel for searching for themes and extensions on GitHub and installing them. | toggleGitHub |
| `Refresh Panes` | This will reload files in both the left and right pane. | refreshPanes |
| `Refresh Left Pane` | This will reload the files in the Left Pane. | refreshLeftPane  |
| `Refresh Right Pane` | This will reload the files in the Right Pane. | refreshRightPane |
| `Rerun Last Command` | This will rerun the last command along with it the number of times it was ran. | reRunLastCommand |
|`Toggle Filter` | Toggles the show all and default filters. | toggleFilter |
| `Show All Filter` | Sets to show all Entries. | setShowAllFilter |
| `Show Only Non-System Files/Folders` | Sets the default filter of not showing system files/folders. | setDefaultFilter |
| `Open in Opposite Panel` | Opens the directory the cursor is on or the directory the cursor is in in the opposite panel. | openOppositePanel |
| `Reload Extensions` | Reload all the extensions, keyboard maps, and theme. | reloadExtensions |

### Extension Commands

These commands require inputs and supply results. Therefore these commands can`t be used in hotkeys or the command prompt. They are loaded and used in a different way as well. Please refer to the [Creating Extensions Section](#creating-extensions) for more details.

| Function Name | Description |
| --- | ---------- |
| `setCursor` | Set the cursor to the file name given in the current panel. |
| `getCursor` | Get the current cursor. |
| `cursorToPane` | Set the cursor to the pane given. Either "left" or "right" |
| `changeDir` | Change the directory of a pane and make it the current. |
| `addKeyboardShort` | A a shortcut for a keyboard map. |
| `getLeftFile` | Get the current file for the left pane. |
| `getRightFile` | Get the current file for the right pane. |
| `getTheme` | Get the current values for the theme. |
| `setTheme` | Set the values for the current theme. |
| `getOS` | Get the local OS name. |
| `addDirectoryListener` | Add a listener to directory changes. |
| `getLastError`   | returns the last error. |
| `getSelectedFiles` | Returns a list of Entries that have been selected. |
| `getCurrentFile`   | Get the current file. |
| `getCurrentPane` | Get the pane that is currently active. |
| `addSpinner` | Add a message box spinner value. | 
| `updateSpinner` | Update a message box spinner value. | 
| `removeSpinner` | Remove a message box spinner value. | 
| `keyProcessor` | Send a keystroke to be processed. | 
| `stringKeyProcessor` | Send a string of keystrokes to be processed. | 
| `askQuestion` | Ask a question and get the response. |
| `pickItem` | Choose from a list of items. |
| `showMessage` | Show a message to the user. |
| `createNewMode` | Allows the creation of a new mode for keyboard commands. |
| `changeMode` | Change to mode given. |
| `switchView` | Change to new program view. Currently `filemanager` or `preferences`. |
| `copyEntriesCommand` | Copy the entry list to the destination entry. |
| `moveEntriesCommand` | Move the entry list to the destination entry. |
| `deleteEntriesCommand` | Delete the entry list |
| `editEntryCommand` | Edit the entry |
| `getRightDir` | Get the directory path for the right panel. |
| `getLeftDir` | Get the directory path for the left panel. |
| `addExtraPanelProcessor` | Add a object for processing extra panel informaiton. |

## Creating Themes

A theme is a GitHub repository or a repository on your system. It is setup as a normal npm project with a `package.json` file. The `package.json` file should be similar to this:

```json 
{
  "name": "dracula-ThemeModalFileManager",
  "version": "1.0.0",
  "description": "The Dracula theme for Modal File Manager.",
  "keywords": [
    "modalfilemanager"
  ],
  "author": "Richard Guay",
  "license": "MIT",
  "mfmtheme": {
    "name": "dracula-ThemeModalFileManager",
    "description": "Dracula theme for Modal File Manager.",
    "type": 0,
    "github": "",
    "main": "dracula.json"
  }
}
```

The subheading `mfmtheme` contains the information the program will use to load the theme. The `main` is set to the path of the JSON file containing the themes values. If it's in the top of the directory, then use just the file name as seen above.

The `type` is 0 for local only and 1 for a GitHub download. The `github` value is the URL to the repository on GitHub. The `description` is shown to the user that should accurately describe the theme.

The Theme JSON file is like this one:

```json 
{
  "font":"Fira Code, Menlo",
  "fontSize":"12pt",
  "cursorColor": "#363443",
  "selectedColor": "#FFCA80",
  "backgroundColor": "#22212C",
  "textColor": "#F8F8F2",
  "borderColor": "#1B1A23",
  "normalbackgroundColor": "#80FFEA",
  "insertbackgroundColor": "#8AFF80",
  "visualbackgroundColor": "#FF80BF",
  "Cyan": "#80FFEA",
  "Green": "#8AFF80",
  "Orange": "#FFCA80",
  "Pink": "#FF80BF",
  "Purple": "#9580FF",
  "Red": "#FF9580",
  "Yellow": "#FFFF80"
}

```

It should be a proper JSON structure with these definitions. Change the color values as you want.

## Creating Extensions

TODO:  Documentation Coming Soon.

## Tutorials on Modal File Manager

- [My Side Project: Modal File Manager](https://blog.customct.com/my-side-project-modal-file-manager)
- [Modal File Manager: Update and Extensions](https://blog.customct.com/modal-file-manager-update-and-extensions)

## Adding Video Preview on Extra Panel

The normal copy of NW.js doesn't come with the codeces for displaying videos. In order for this feature, you will have to download the dynamically loaded library for your system from here:  https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases.

Then place this in your copy of NW.js as described in step 5 here:  http://docs.nwjs.io/en/latest/For%20Developers/Enable%20Proprietary%20Codecs/#enable-proprietary-codecs-in-nwjs

With this library in place, the Extra Panel will run mp4 files just fine. I haven't testing other versions since that what I mostly use.

## Icon

I finally made my first attempt at an icon for Modal File Manager. The files are in the `icons` directory. Any constructive criticizm is welcome.

![Icon](icons/mfm-icon.svg)


