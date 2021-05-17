<FileManager 
  on:switchView={switchView}
  component={showComponent}
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

  let showComponent = 'filemanager';

  function switchView(v) {
    showComponent = v.detail.view;
  }
</script>
