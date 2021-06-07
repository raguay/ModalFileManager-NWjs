import Start from './Start.svelte';

var mb = new nw.Menu({type:"menubar"});
var submenu = new nw.Menu();
submenu.append(new nw.MenuItem({
  label: "About MFM"
}));
submenu.append(new nw.MenuItem({ type: 'separator' }));
submenu.append(new nw.MenuItem({
  label: "Quit MFM",
  click: function() {
    nw.App.closeAllWindows();
  },
  key: 'q'
}))
mb.append(new nw.MenuItem({
  label: "MFM",
  tooltip: "MFM",
  submenu: submenu
}));
nw.Window.get().menu = mb;

const ST = new Start({
  target: document.body,
  props: {}
});

export default ST;
