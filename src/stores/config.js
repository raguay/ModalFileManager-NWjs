import { writable, get } from 'svelte/store';

var confg = {
  configDir: '',
  localFS: null,
  configuration: {}
}

export const config = writable(confg);

