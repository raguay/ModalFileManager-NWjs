import { writable, get } from 'svelte/store';

var confg = {
  configDir: '',
  localFS: null
}

export const config = writable(confg);

