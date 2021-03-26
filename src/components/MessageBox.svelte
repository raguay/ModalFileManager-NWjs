<div id='messageboxbg'>
  <div id='messagebox'
       style="background-color: {$theme.backgroundColor};
              border-color: {util.pSBC(.1,$theme.backgroundColor)};
              color: {$theme.textColor};" 
  >
    <h2>{config.title}</h2>
    {#each config.items as item}
      {#if item.type === 'input'}
        <p>{item.msg}</p>
        <input type="text" 
               id="{item.id}"
               bind:value={item.value}
               on:keydown={(e) => {
                if(e.key === 'Enter') {
                  e.preventDefault();
                  returnValue(true);
                }
               }}
        />
      {:else if item.type === 'selector'}
        <select
          id="{item.id}"
          bind:value={item.value}
        >
          {#each item.selections as selection}
            <option
              value={selection.value}
            >
              {selection.name}
            </option>
          {/each}
        </select>
      {:else if item.type === 'spinner'}
        <progress
          id={item.name}
          value={item.value}
          max="100"
        />
      {:else if item.type === ''}
        <p>testing</p>
      {/if}
    {/each}
    <div id='butRow'>
      <button on:click={(e) => { returnValue(false); }} >
        Okay
      </button>
      <button on:click={cancel} >
        Cancel
      </button>
    </div>
  </div>
</div>

<style>
  #messageboxbg {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background-color: transparent;
    z-index: 100;
  }

  #messagebox {
    display: flex;
    flex-direction: column;
    margin: auto;
    padding: 10px;
    width: 70%;
    border: 3px solid;
    border-radius: 5px;
  }

  #butRow {
    display: flex;
    flex-direction: row;
  }

  #butRow button:first-child {
    margin: auto 10px auto auto;
    border-radius: 5px;
  }
  
  #butRow button:last-child {
    margin: auto auto auto 10px;
    border-radius: 5px;
  }
</style>

<script>
  import { createEventDispatcher, onMount, afterUpdate, tick } from 'svelte';
  import util from '../modules/util.js';
  import { theme } from '../stores/theme.js';
  import { keyProcess } from '../stores/keyProcess.js';

  const dispatch = createEventDispatcher();

  export let config;
  export let spinners = [];
  
  $: config = updateSpinners(spinners);

  onMount(() => {
    //
    // Turn off key processing.
    //
    keyProcess.set(false);
    
    //
    // Return a function to be called when this component no longer
    // is being shown.
    //
    return(() => {
    })
  });

  afterUpdate(async () => {
    await tick();
    var main = window.document.getElementById('msgboxMain');
    main.focus();
  });

  function updateSpinners(spins) {
    if((typeof config !== 'undefined')&&(typeof spins === 'object')&&(spins.length > 0)) {
      return config.items.map(item => {
        if(item.type === 'spinner') {
          const nval = spins.find(spitem => spitem.name === item.name);
          if(nval !== 'undefined') item.value = nval;
        }
      });
    } else {
      return(config);
    }
  }

  function returnValue(skip) {
    if(typeof skip === 'undefined') skip = false;
    keyProcess.set(true);
    dispatch('msgReturn', {
      ans: config
    });
    dispatch('closeMsgBox',{
      skip: skip
    });
  }

  function cancel(e) {
    var skip = false;
    keyProcess.set(true);
    dispatch('closeMsgBox',{
      skip:skip
    });
  }
</script>

