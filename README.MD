#Child MQQT

Simple daemon which checks current time and shutdowns computer if it is too late.

Also it seens information about current network and shutdown action.

To use:
1. Copy `config/sample.json` to `config/runtime.json`
2. Edit values in `runtime.json`
3. Run `npm run build`
4. Test it with `npm start`
5. Add it to cron, like `node ./index.js`
