## build

> Build the Modal File Manager.

**OPTIONS**
* dev
  * flags: -d --dev
  * type: boolean
  * desc: Runs the development build which doesn't compile the bitcode.

```fish
npm run build
if set -q dev
  rm public/index.html
  rm -Rf mfm.app/Contents/Resources/app.nw
  mkdir mfm.app/Contents/Resources/app.nw
  cp public/index-dev.html public/index.html
  cp public/*.js mfm.app/Contents/Resources/app.nw
  cp public/index.html mfm.app/Contents/Resources/app.nw
  cp public/package.json mfm.app/Contents/Resources/app.nw
  cp public/*.css mfm.app/Contents/Resources/app.nw
  cp icons/mfm-icon.icns mfm.app/Contents/Resources/app.icns
else
  /Applications/nwjs-sdk/nwjc public/bundle.js public/bundle.bin
  rm public/*.map
  rm -Rf mfm.app/Contents/Resources/app.nw
  mkdir mfm.app/Contents/Resources/app.nw
  rm public/index.html
  cp public/index-normal.html public/index.html
  cp public/*.bin mfm.app/Contents/Resources/app.nw
  cp public/index.html mfm.app/Contents/Resources/app.nw
  cp public/package.json mfm.app/Contents/Resources/app.nw
  cp public/*.css mfm.app/Contents/Resources/app.nw
  cp icons/mfm-icon.icns mfm.app/Contents/Resources/app.icns
end
```

## launch

> Launch the application using the sdk version of NW.js.

**OPTIONS**
* dev
  * flags: -d --dev
  * type: boolean
  * desc: Runs the development build which doesn't compile the bitcode.

```fish
if set -q dev
  /Applications/nwjs-sdk/nwjs.app/Contents/MacOS/nwjs ./public > /dev/null 2>&1 &
else
  /Applications/nwjs.app/Contents/MacOS/nwjs ./public > /dev/null 2>&1 &
end
```

## launchapp
> Launch the application.

```fish
open -a mfm.app .
```

