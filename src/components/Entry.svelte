{#if ((localCursor.pane === pane) && (localCursor.entry.name == entry.name))}
<div class='entry' 
     style="background-color: {localTheme.cursorColor};"
     on:click={cursorToEntry(pane, entry, index)}
     on:dblclick={openEntry(pane, entry, index)}
     bind:this={DOM}
     draggable="true"
     on:dragstart={dragStart}
     on:dragover={(e) => { dropFiles(e,'dragover'); }}
     on:dragend={(e) => { dropNoPrevent(e,'dragend'); }}
     on:drop={(e) => { dropFiles(e, 'drop'); }}
     on:dragenter={(e) => {dropNoPrevent(e, 'dragenter'); }}
>
  <span class='type'>
    {#if entry.type === 0}
      <FaRegFileAlt />
    {:else if entry.type === 1}
      <FaRegFolder />
    {:else}
      <FaExternalLinkAlt />
    {/if}
  </span>
  <span class='name' style="color: {entry.selected ? localTheme.selectedColor : localTheme.textColor};">{entry.name}</span> 
</div>
{:else }
<div class='entry' 
     style="background-color: 'transparent';"
     on:click={cursorToEntry(pane, entry, index)}
     on:dblclick={openEntry(pane, entry, index)}
     bind:this={DOM}
>
  <span class='type'>
    {#if entry.type === 0}
      <FaRegFileAlt />
    {:else if entry.type === 1}
      <FaRegFolder />
    {:else}
      <FaExternalLinkAlt />
    {/if}
  </span>
  <span class='name' 
        style="color: {entry.selected ? localTheme.selectedColor : localTheme.textColor};"
  >
    {entry.name}
  </span> 
</div>
{/if}

<style>
  .entry {
    display: flex;
    flex-direction: row;
    height: 20px;
    max-height: 20px;
    min-height: 20px;
    width: 100%;
    margin: 3px 3px;
  }

  .name {
    white-space: nowrap;
  }

  .type {
    height: 20px;
    width: 20px;
    min-height: 20px;
    min-width: 20px;
    max-height: 20px;
    max-width: 20px;
    margin: 0px 10px 0px 5px;
  }
</style>

<script>
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import { currentCursor } from '../stores/currentCursor.js';
  import { theme } from '../stores/theme.js';
  import { currentLeftFile } from '../stores/currentLeftFile.js';
  import { currentRightFile } from '../stores/currentRightFile.js';
  import FaRegFolder from 'svelte-icons/fa/FaRegFolder.svelte';
  import FaRegFileAlt from 'svelte-icons/fa/FaRegFileAlt.svelte';
  import FaExternalLinkAlt from 'svelte-icons/fa/FaExternalLinkAlt.svelte'

  export let pane;
  export let entry;
  export let index;
  export let utilities;

  const dispatch = createEventDispatcher();

  let DOM;
  let localCursor = {
    pane: 'right',
    entry: {
      name: ''
    }
  };
  let localTheme = {
    cursorColor: 'pink'
  };

  onMount(() => {
    var unsubscribeCurrentCursor = currentCursor.subscribe(async (value) => {
      localCursor = value;
      await tick();
      if(typeof localCursor.entry !== 'undefined') {
        if(typeof localCursor.entry.name !== 'undefined') {
          if((localCursor.pane === pane) && (localCursor.entry.name == entry.name)) { 
            var viewable = elementInViewport(DOM);
            if(!viewable.visible) {
              dispatch('changeViewing', {
                dom: DOM,
                dir: viewable.dir
              });
            }
          }
        } else {
          localCursor.entry = {
            name: '',
            size: '',
            type: 'local',
            dir: '',
            datetime: '',
            selected: false
          };
        }
      } else {
        localCursor.entry = {
          name: '',
          size: '',
          type: 'local',
          dir: '',
          datetime: '',
          selected: false
        };
      }
    });
    var unsubscribeTheme = theme.subscribe(value => {
      localTheme = value;
    });
    return(() => {
      unsubscribeCurrentCursor();
      unsubscribeTheme();
    })
  });

  function elementInViewport(el) {
    var windowInner = window.innerHeight - 31;
    var boundingEl = el.getBoundingClientRect();
    
    return ({
      visible: (boundingEl.top >= 23) && (boundingEl.bottom <= windowInner),
      dir: (boundingEl.top < 23) ? boundingEl.top - 23 : boundingEl.bottom - windowInner
    });
  }

  function cursorToEntry(pane, entry, index) {
    currentCursor.set({
      pane: pane,
      entry: entry
    });

    if(pane === 'right') {
      currentRightFile.set(
        {
          entry: entry
        }
      );
    } else {
      currentLeftFile.set(
        {
          entry: entry
        }
      )
    }
  }

  function openEntry(pane, entry, index) {
    if(entry.type === 0) {
      //
      // It is a file, open it.
      //
      dispatch('openFile', { entry: entry});
    } else {
      //
      // It is a directory. Go into it.
      //
      var newDir = utilities.appendPath(entry.dir, entry.name);
      dispatch('changeDir', {
        path: newDir,
        cursor: true 
      });
    }
  }

  function dragStart(e) {
    e.dataTransfer.dropEffect = 'copy';
    const file = utilities.appendPath(entry.dir, entry.name);
    e.dataTransfer.setData('text/plain', file);
    e.dataTransfer.setData('text/uri-url', "file://" + file);
    e.dataTransfer.setData("text/x-moz-url", "file://"+file);
    e.dataTransfer.setData("application/x-moz-file-promise-url", "file://" + file);
  }
  
  function dropFiles(e,type) {
    e.preventDefault();
    const dataTrans = e.dataTransfer;
  }
  
  function dropNoPrevent(e,type) {
    const dataTrans = e.dataTransfer;
  }
</script>
