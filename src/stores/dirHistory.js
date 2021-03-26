import { writable, get } from 'svelte/store';
import { config } from '../stores/config.js';

var history = {
  histStore: [],
  addHistory: function(dir) {
    var el = this.histStore.find(item => item.toLowerCase().includes(dir.toLowerCase()));
    if((typeof el === 'undefined')||(el === null)) {
      this.histStore.push(dir);
      this.saveHistory();
    }
  },
  searchHistory: function(pat) {
    return this.histStore.filter(item => item.toLowerCase().includes(pat.toLowerCase()));
  },
  saveHistory: function() {
    const cfg = get(config);
    if((cfg.configDir !== '')&&(cfg.localFS !== null)) {
      // 
      // Save the history.
      //
      cfg.localFS.writeFile(cfg.localFS.appendPath(cfg.configDir, 'history.json'), JSON.stringify(this.histStore));
    }
  },
  loadHistory: function() {
    const cfg = get(config);
    const hf = cfg.localFS.appendPath(cfg.configDir, 'history.json');
    if((cfg.configDir !== '')&&(cfg.localFS !== null)) {
      // 
      // load the history.
      //
      if(cfg.localFS.fileExists(hf)) {
        this.histStore = JSON.parse(cfg.localFS.readFile(cfg.localFS.appendPath(cfg.configDir, 'history.json')));
      } 
    }
  }
}

export const dirHistory = writable(history);

