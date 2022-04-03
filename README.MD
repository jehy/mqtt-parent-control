# MQQT parent control

[![Build](https://github.com/jehy/mqtt-parent-control/workflows/Build/badge.svg)](https://github.com/jehy/mqtt-parent-control/actions/workflows/main.yml)


Several utilities for parent control over MQQT:

1. Shutdown computer when use in non allowed time.
2. Check for running of exact process (Linux only).
3. Get CPU Usage.
4. Get WiFi network
5. Set online status when computer is turned on

To use:
1. Clone repo
2. Copy `config/sample.json` to `config/runtime.json`
3. Edit values in `runtime.json`
4. Run `npm run build`
5. Test it with `npm start`
6. Add it to cron, like `node ./index.js`
