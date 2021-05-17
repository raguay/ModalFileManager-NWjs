<div
  id='Preferences'
  style="background-color: {$theme.backgroundColor};
         color: {$theme.textColor};
         font-family: {$theme.font};
         font-size: {$theme.fontSize};"
>
  <h2>Preferences</h2>
  <ul>
    {#if showPanel === 'general'}
      <li
        on:click={(e) => { showPanel = 'general'; }}
        style="border-color: {$theme.textColor};
               background-color: {$theme.textColor};
               color: {$theme.backgroundColor};"
      >
        General
      </li>
    {:else}
      <li
        on:click={(e) => { showPanel = 'general'; }}
        style="border-color: {$theme.textColor};
               color: {$theme.textColor};
               background-color: {$theme.backgroundColor};"
      >
        General
      </li>
    {/if}
    {#if showPanel === 'theme'}
      <li
        on:click={(e) => { showPanel = 'theme'; }}
        style="border-color: {$theme.textColor};
               background-color: {$theme.textColor};
               color: {$theme.backgroundColor};"
      >
        Theme
      </li>
    {:else}
      <li
        on:click={(e) => { showPanel = 'theme'; }}
        style="border-color: {$theme.textColor};
               color: {$theme.textColor};
               background-color: {$theme.backgroundColor};"
      >
        Theme
      </li>
    {/if}
  </ul>
  {#if showPanel === 'general'}
    <GeneralPrefs />
  {:else if showPanel === 'theme'}
    <ThemePrefs />
  {/if}
  <div
    id='buttonRow'
  >
    <button 
    style="color: {$theme.backgroundColor};
           background-color: {$theme.textColor};
           font-family: {$theme.font};
           font-size: {$theme.fontSize};"
      on:click={() => {
        exitPrefs();
      }}
    >
      Exit Preferences
    </button>
  </div>
</div>

<style>
  #Preferences {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 100;
    width: 100%;
    height: 100%;
  }

  #buttonRow {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 5px;
  }

  #buttonRow button {
    margin: auto;
    border-radius: 5px;
    padding: 5px;
  }

  ul {
    display: flex;
    flex-direction: row;
    padding: 0px;
    margin: 0px 5px 0px 10px;
  }

  ul li {
    border-radius: 25px 5px 0px 0px;
    border: 3px solid;
    padding: 5px 5px 2px 15px;
    margin: 0px 10px 0px 0px;
    list-style: none;
  }

  h2 {
    text-align: center;
    margin-top: 3px;
  }
</style>

<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { theme } from '../stores/theme.js';
  import GeneralPrefs from './GeneralPrefs.svelte';
  import ThemePrefs from './ThemePrefs.svelte';
  import macOS from '../modules/macOS.js';
  import linux from '../modules/linux.js';
  import windows from '../modules/windows.js';
 
  const os = require('os');
	const dispatch = createEventDispatcher();

  let localFStype;
  let localFS;
  let configDir;
  let osNames = ['macOS', 'linux', 'windows'];
  let showPanel = 'general';

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
    // return a command to unsubscribe from everything.
    //
    return(() => {
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

  function switchView(view) {
    if((view === 'filemanager')||(view === 'preferences')) {
      dispatch('switchView', {
        view: view
      });
    }
  }

  function exitPrefs() {
    switchView('filemanager');
  }
</script>

