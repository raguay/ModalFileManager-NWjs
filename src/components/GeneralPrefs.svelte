<div
  id='general' 
>
  {#if localConfig !== null}
    <div 
      class='row'
    >
      <label
        for='trashcanans'
      >
        Use the Trashcan? 
      </label>
      {#if localConfig.configuration.useTrash}
        <input 
          id='trashcanans'
          type='checkbox'
          on:change={trashChanged}
          checked
        />
      {:else}
        <input 
          id='trashcanans'
          type='checkbox'
          on:change={trashChanged}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  #general {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  #trashcanans {
    margin: auto 0px auto 10px;
  }

  .row {
    display: flex;
    flex-direction: row;
    margin: 10px;
  }
</style>

<script>
  import { onMount } from 'svelte';
  import { config } from '../stores/config.js';

  let localConfig = null;

  onMount(() => {
    var unsubscribeConfig = config.subscribe(value => {
      // 
      // The Config.configuration is what we can change. It contains:
      // 
      // env          The environment to use when executing command line programs.
      // useTrash     If true, delete to the trashcan, otherwise delete with 'rm' command.
      //
      localConfig = value;
    });

    return(() => {
      unsubscribeConfig();
    });
  });

  function trashChanged(e) {
    localConfig.configuration.useTrash = e.target.checked;
    saveConfig();
  }

  function saveConfig() {
    config.set(localConfig);
    localConfig.localFS.writeFile(localConfig.localFS.appendPath(localConfig.configDir,'config.json'), JSON.stringify(localConfig.configuration));
    localConfig.localFS.setConfig(localConfig.configuration);
  }
</script>
