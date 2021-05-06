<div  id='GitHub'
      style="background-color: {$theme.backgroundColor};
             border-color: {util.pSBC(.1,$theme.backgroundColor)};
             max-height: {getHeight()}px;
             width: {width !== null ? width : 100}px;
             color: {$theme.textColor};" 
      on:blur={(e) => { exitGitHub(); }}
>
  <div id='GitHubHeader'>
    <h3>GitHub Themes and Extensions Importer</h3>
    <span
      on:click={(e) => {
        exitGitHub();
      }}
      style="color: {$theme.Red};"
    >
     X
    </span>
  </div>
  <div id='GitHubList'
       bind:this={pickerDOM}
       on:keydown={inputChange}
  >
    {#await repos}
      <h3>Loading Extensions Repositories....</h3>
    {:then value}
      {#if check(value)}
        {#each value.data.items as repo}
          <div class='repoblock'>
            <div class='reporow'>
              <p class='reponame'>
                {repo.name}
              </p>
              <p class='repostars'
                 style="color: {$theme.Yellow};"
              >
                {repo.stargazers_count} ⭐️ s
              </p>
            </div>
            <div class='reporow'>
              <p class='repodisc'>
                {repo.description}
              </p>
            </div>
            {#if hasMsg(repo)}
              <div class='reporow'
                   style="color: {$theme.Red};"
              >
                {@html getMsg(repo)}
              </div>
            {/if}
            <div class='repobuttons'>
              {#if extExists(repo)}
                <button
                  on:click={(e) => {
                    deleteExtension(repo);
                  }}
                  style="background-color: {$theme.Red};"
                >
                  Delete
                </button>
              {:else}
                <button
                  on:click={(e) => {
                    installExtension(repo);
                  }}
                  style="background-color: {$theme.Green};"
                >
                  Install
                </button>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    {:catch error}
      <h2>There was an error: {error}</h2>
    {/await}
    {#await themes}
      <h3>Loading Theme Repositories....</h3>
    {:then valueTheme}
      {#if check(valueTheme)}
        {#each valueTheme.data.items as thm}
          <div class="repoblock">
            <div class='reporow'>
              <p class='reponame'>
                {thm.name}
              </p>
              <p class='repostars'
                 style="color: {$theme.Yellow};"
              >
                {thm.stargazers_count} ⭐️ s
              </p>
            </div>
            <div class='reporow'>
              <p class='repodisc'>
                {thm.description}
              </p>
            </div>
            {#if hasMsg(thm)}
              <div class='reporow'
                   style="color: {$theme.Red};"
              >
                {@html getMsg(thm)}
              </div>
            {/if}
            <div class="repobuttons">
              {#if themeExists(thm)}
                <button
                  on:click={(e) => {
                    loadTheme(thm);
                  }}
                  style="background-color: {$theme.Green};"
                >
                  Load
                </button>
                <button
                  on:click={(e) => {
                    deleteTheme(thm);
                  }}
                  style="background-color: {$theme.Red};"
                >
                  Delete
                </button>
              {:else}
                <button
                  on:click={(e) => {
                    installTheme(thm);
                  }}
                  style="background-color: {$theme.Green};"
                >
                  Install
                </button>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    {:catch error}
      <h2>There was an error: {error}</h2>
    {/await}
  </div>
</div>

<style>
  #GitHub {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 20px;
    left: 20px;
    border: 3px solid;
    border-radius: 3px;
    z-index: 100;
  }

  #GitHubHeader {
    display: flex;
    flex-direction: row;
    margin: 10px;
  }

  #GitHubHeader h3 {
    margin: 0px auto 0px 0px;
  }

  #GitHubHeader span {
    margin: 0px 0px 0px auto;
  }

  #GitHubList {
    margin: 5px 10px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .reporow {
    display: flex;
    flex-direction: row;
    margin: 0px;
  }

  .reponame {
    margin: 0px auto 0px 0px;
  }

  .repostars {
    margin: 0px 0px 0px auto;
  }

  .repodisc {
    margin: 0px 0px 0px 15px;
  }

  .repoblock {
    display: flex;
    flex-direction: column;
    margin: 5px 0px;
  }

  .repobuttons {
    display: flex;
    flex-direction: row;
    margin: 5px auto;
  }

  .repobuttons button {
    margin: 0px 10px;
    border-radius: 5px;
  }
</style>

<script>
  import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
  import { get } from 'svelte/store';
  import { theme } from '../stores/theme.js';
  import { config } from '../stores/config.js';
  import { keyProcess } from '../stores/keyProcess.js';
  import util from '../modules/util.js';
  import { Octokit } from "@octokit/rest";

  const dispatch = createEventDispatcher();

  var octok;
  var repos;
  var themes;
  var width = null;
  var msgs = [];
  var pickerDOM;

  onMount(() => {
    keyProcess.set(false);
    width = window.innerWidth - 30;
    octok = new Octokit();
    loadRepoInfo();
    setTimeout(() => {
      keyProcess.set(false);
      if(typeof pickerDOM !== 'undefined') pickerDOM.focus();
    }, 1000);
  });

  afterUpdate(() => {
    if(typeof pickerDOM !== 'undefined') {
      pickerDOM.focus();
    }
  });

  function loadRepoInfo() {
    if(typeof repos !== 'undefined') {
      repos = {};
    }
    if(typeof themes !== 'undefined') {
      themes = {};
    }
    repos = octok.search.repos({
      q: 'topic:modalfilemanager+topic:extension'
    });
    themes = octok.search.repos({
      q: 'topic:modalfilemanager+topic:theme'
    });
  }

  function getHeight() {
    // 
    // The height of the window minus (status line + Directory + top location)
    //
    return window.document.body.clientHeight - 61;
  }

  function exitGitHub() {
    keyProcess.set(true);
    dispatch('closeGitHub',{});
  }

  function check(val) {
    return((typeof val !== 'undefined')&&
           (typeof val.data !== 'undefined')&&
           (typeof val.data.items !== 'undefined'));
  }

  function installTheme(thm) {
    var confg = get(config);
    var thmDir = confg.localFS.appendPath(confg.configDir,'themes');
    thmDir = confg.localFS.appendPath(thmDir, thm.name);
    if(!confg.localFS.dirExists(thmDir)) {
      confg.localFS.createDir(thmDir);
    }
    confg.localFS.runCommandLine("git clone '" + thm.git_url + "' '" + thmDir + "';", (err, stdin, stdout) => {
      // 
      // The clone should be there. Let's load the new theme.
      // 
      loadTheme(thm);
      loadRepoInfo();
    });
  }

  function loadTheme(thm) {
    var confg = get(config);
    var thmDir = confg.localFS.appendPath(confg.configDir,'themes');
    thmDir = confg.localFS.appendPath(thmDir, thm.name);
 
    if(confg.localFS.fileExists(confg.localFS.appendPath(thmDir, 'package.json'))) {
      var manifest = JSON.parse(confg.localFS.readFile(confg.localFS.appendPath(thmDir, 'package.json')));
      var newTheme = JSON.parse(confg.localFS.readFile(confg.localFS.appendPath(thmDir, manifest.mfmtheme.main)));
      theme.set(newTheme);
      addMsg(thm, "This theme is now being used.");
    } else {
      console.log("The theme doesn't have a package.json file.");
      addMsg(thm, "The theme doesn't have a package.json file.");
    }
  }

  function themeExists(thm) {
    var confg = get(config);
    var thmDir = confg.localFS.appendPath(confg.configDir,'themes');
    thmDir = confg.localFS.appendPath(thmDir, thm.name);
    return(confg.localFS.dirExists(thmDir))
  }

  function deleteTheme(thm) {
    var confg = get(config);
    var thmDir = confg.localFS.appendPath(confg.configDir,'themes');
    thmDir = confg.localFS.appendPath(thmDir, thm.name);
    confg.localFS.runCommandLine('rm -Rf "' + thmDir + '";', (err, stdin, stdout) => {
      loadRepoInfo();
    })
  }

  function installExtension(ext) {
    var confg = get(config);
    var extDir = confg.localFS.appendPath(confg.configDir,'extensions');
    extDir = confg.localFS.appendPath(extDir, ext.name);
    if(!confg.localFS.dirExists(extDir)) {
      confg.localFS.createDir(extDir);
    }
    confg.localFS.runCommandLine("git clone '" + ext.git_url + "' '" + extDir + "';", (err, stdin, stdout) => {
      addMsg(ext,'Restart the program to use this extension.');
      loadRepoInfo();
    });
  }
  
  function extExists(ext) {
    var confg = get(config);
    var extDir = confg.localFS.appendPath(confg.configDir,'extensions');
    extDir = confg.localFS.appendPath(extDir, ext.name);
    return(confg.localFS.dirExists(extDir))
  }
  
  function deleteExtension(ext) {
    var confg = get(config);
    var extDir = confg.localFS.appendPath(confg.configDir,'extensions');
    extDir = confg.localFS.appendPath(extDir, ext.name);
    confg.localFS.runCommandLine('rm -Rf "' + extDir + '";', (err, stdin, stdout) => {
      loadRepoInfo();
      addMsg(ext, 'Rerun the application to remove the extension from memory.');
    });
  }

  function hasMsg(rp) {
    if(msgs.length > 0) {
      return(msgs.find(item => item.name === rp.name) !== 'undefined');
    } else {
      return(false);
    }
  }

  function getMsg(rp) {
    if(hasMsg(rp)) {
      var item = msgs.find(item => item.name === rp.name);
      if(typeof item !== 'undefined') {
        return(item.msg);
      } else {
        return('');
      }
    } else {
      return('');
    }
  }

  function addMsg(rp,msg) {
    msgs.push({
      name: rp.name,
      msg: msg
    });
    msgs = msgs;
    themes = themes;
    repos = repos;
  }
  
  function inputChange(e) {
    console.log('GitHub key Processing...');
    
    if((e.key === 'ArrowUp')||(e.key === 'k')) {
      // 
      // Go up the list. Zero is at the top.
      //
      scrollDOM(-1);
    } else if((e.key === 'ArrowDown')||(e.key === 'j')) {
      // 
      // Go down the list. The largest index is at the bottom.
      //
      scrollDOM(1);
    } else if(e.key === 'Escape') {
      //
      // Escape key. Just exit without doing anything.
      //
      exitGitHub();
    }
  } 

  function scrollDOM(amount) {
    var adj = amount * 20;

    if(pickerDOM !== null) {
      pickerDOM.scrollTop += adj;
      if(pickerDOM.scrollTop < 0) pickerDOM.scrollTop = 0;
      if(pickerDOM.scrollTop > pickerDOM.clientHeight) pickerDOM.scrollTop = pickerDOM.clientHeight;
    }
  }
</script>

