<div class='panel'
     bind:this={DOM}
>
  {#each entries as entry,index}
    <Entry 
      pane={pane} 
      index={index}
      entry={entry}
      utilities={utilities}
      on:changeDir={changeDir}
      on:openFile={openFile}
      on:changeViewing={changeViewingDOM}
    />
  {:else}
    <div class="empty"></div>
  {/each}
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .empty {
    height: 0px;
    width: 0px;
    visibility: hidden;
  }
</style>

<script>
  import { createEventDispatcher } from 'svelte';
  import Entry from './Entry.svelte';

  export let pane = 'left';
  export let entries = [];
  export let utilities;

  const dispatch = createEventDispatcher();

  let DOM;

  function changeDir(e) {
    dispatch('changeDir', {
      dir: e.detail,
      pane: pane
    });
  }

  function openFile(e) {
    dispatch('openFile', e.detail);
  }

  function changeViewingDOM(e) {
    var elDOM = e.detail;
    if(elDOM !== null) {
      DOM.scrollTop += elDOM.dir;
      if(DOM.scrollTop < 0) DOM.scrollTop = 0;
    }
  }
</script>
