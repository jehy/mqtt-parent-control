# MQTT parent control

[![Build](https://github.com/jehy/mqtt-parent-control/workflows/Build/badge.svg)](https://github.com/jehy/mqtt-parent-control/actions/workflows/main.yml)


Several utilities for parent control over MQTT:

1. Shutdown computer when use in non-allowed time
2. Shutdown computer manually if needed
3. Check for running of exact process
4. Get CPU Usage
5. Get currently used WiFi network
6. Get currenly active window
7. Get all open windows
8. See when computer is online

Windows and Linux supported.

## Installation

### On client
You need Node.JS 18 installed on your computer.

1. Clone repo
2. Copy `config/sample.json` to `config/runtime.json`
3. Edit values in `runtime.json`
4. Run `npm run build`
5. Test it with `npm start`


Then, for **Linux**:
* Add it to cron, like `node ./build/index.js` and run it every minute

For **Windows**:
* Add to task scheduler  `run-hidden.exe` from repo root (you can compile it manually from [here](https://github.com/jehy/run-hidden) if you don't trust this exe file)
 with params like `node build\index.js` and run it every minute after user login via this user's account. `Exe` file is required to run node.js in background.

### On Home Assistant server
You can use any MQTT integration, but in case you use Home Assistant you can can use following instructions:

Add MQTT devices:

```yaml
switch:
  - platform: mqtt
    unique_id: pc_delay
    name: "vasya pc delay"
    command_topic: "home/vasya/pc/delay"
    payload_on: 1
    payload_off: 0
    retain: true

  - platform: mqtt
    unique_id: pc_off
    name: "vasya pc forceOff"
    command_topic: "home/vasya/pc/forceoff"
    payload_on: 1
    payload_off: 0
    retain: true

binary_sensor:
  - platform: mqtt
    unique_id: vasya-mimimi
    name: "vasya mimimi"
    state_topic: "home/vasya/pc/online"
    payload_on: "1"
    device_class: "running"
    qos: 0
    expire_after: 120

sensor:
- platform: mqtt
  unique_id: vasya-pc-window-active
  name: "vasya pc window active"
  state_topic: "home/vasya/pc/window/active"
  qos: 0
  expire_after: 120

- platform: mqtt
  unique_id: vasya-pc-window-all
  name: "vasya pc window all pc"
  state_topic: "home/vasya/pc/window/all"
  qos: 0
  expire_after: 120

- platform: mqtt
  unique_id: vasya-pc-wifi
  name: "vasya pc wifi"
  state_topic: "home/vasya/pc/net"
  qos: 0
  expire_after: 120

- platform: mqtt
  unique_id: vasya-pc-cpu
  name: "vasya pc cpu"
  state_topic: "home/vasya/pc/cpu"
  unit_of_measurement: '%'
  qos: 0
  expire_after: 120

```

Finally, enjoy :)
