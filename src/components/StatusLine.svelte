<div id='statusLine' style='padding: 0px; 
                      margin: 0px; 
                      background-color: {$theme.backgroundColor};
                      color: {$theme.textColor};
                      border-top: 3px solid {$theme.borderColor};'>
  <span class='state' 
        style='background-color: {stateColor};'
  >
    {localInputState}
  </span>
  <span class='pane'
        style='color: {$theme.Cyan};'
  >
    {localCurrentCursor.pane}
  </span>
  <span class='file'>
    {localCurrentCursor.entry.name}
  </span>
  <span class='file'
        style='color: {$theme.Orange};'
  >
    {localCurrentCursor.entry.datetime}
  </span>
  <span class='file'
        style='color: {$theme.Green};'
  >
    {size}
  </span>
</div>

<style>
  #statusLine {
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    margin: 0px;
    padding: 0px;
    width: 100%;
    min-height: 31px;
    height: 31px;
    max-height: 31px;
    position: fixed;
    bottom: 0px;
    left: 0px;
  }

  .pane {
    margin: 0px 5px;
    padding: 5px 5px;
    width: 30px;
    min-width: 50px;
  }

  .state {
    margin: 0px 0px;
    padding: 5px 10px 5px 10px;
    color: black;
    min-width: 50px;
  }

  .file {
    margin: 0px 5px;
    padding: 5px 5px;
    min-width: 50px;
  }
</style>

<script>
  import { onMount } from "svelte";
  import { theme } from '../stores/theme.js';
  import { currentCursor } from '../stores/currentCursor.js';
  import { inputState } from '../stores/inputState.js';
  import util from '../modules/util.js';

  let localInputState = "normal";
  let localCurrentCursor = {
    entry: {
      name: 'test.txt',
      size: '',
      datetime: ''
    },
    pane: ''
  };
  let localTheme = {};
  let stateColor = "#6fb1e9";
  let size = 0;

  onMount(() => {
    //
    // Here, we are subscribing to the different stores and setting their 
    // default values;
    //
    inputState.subscribe(value => {
      localInputState = value;
      switch(value) {
        case 'normal':
          stateColor = localTheme.normalbackgroundColor;
          break;
        case 'insert':
          stateColor = localTheme.insertbackgroundColor;
          break;
        case 'visual':
          stateColor = localTheme.visualbackgroundColor;
          break;
      }
    })
    currentCursor.subscribe(value => {
      localCurrentCursor = value;
      if(typeof value.entry === 'undefined') {
        localCurrentCursor = {
          entry: {
            name: '',
            size: '',
            datetime: ''
          },
          pane: localCurrentCursor.pane
        }
        size = '';
      } else {
        size = util.readableSize(localCurrentCursor.entry.size);
      }
    });
   theme.subscribe(value => {
      localTheme = value;
      switch(localInputState) {
        case 'normal':
          stateColor = localTheme.normalbackgroundColor;
          break;
        case 'insert':
          stateColor = localTheme.insertbackgroundColor;
          break;
        case 'visual':
          stateColor = localTheme.visualbackgroundColor;
          break;
      }
    });    
  })
</script>

