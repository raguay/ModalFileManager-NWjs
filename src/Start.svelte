<svelte:window
  on:keydown={(e) => {
    $ctrlKey = e.ctrlKey;
    $shiftKey = e.shiftKey;
    $metaKey = e.metaKey;
    if(($skipKey && (e.key === 'Enter'))||(showComponent !== 'filemanager')) {
      $keyProcess = true;
    } else {
      if($keyProcess) {
        if($processKey !== null) $processKey(e);
      }
    }
    $skipKey = false;
  }}
  on:keyup={(e) => {
    $ctrlKey = e.ctrlKey;
    $shiftKey = e.shiftKey;
    $metaKey = e.metaKey;
  }}
/>

<FileManager 
  on:switchView={switchView}
/>
{#if showComponent === 'preferences'}
  <Preferences
    on:switchView={switchView}
  />
{/if}

<style>
  :global(body) {
    padding: 0px;
    margin: 0px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;
  }
</style>

<script>
  import FileManager from "./components/FileManager.svelte";
  import Preferences from "./components/Preferences.svelte";
  import { shiftKey } from "./stores/shiftKey.js";
  import { ctrlKey } from "./stores/ctrlKey.js";
  import { metaKey } from "./stores/metaKey.js";
  import { altKey } from "./stores/altKey.js";
  import { skipKey } from "./stores/skipKey.js";
  import { processKey } from "./stores/processKey.js";
  import { keyProcess } from './stores/keyProcess.js';

  let showComponent = 'filemanager';

  function switchView(v) {
    showComponent = v.detail.view;
  }
</script>
