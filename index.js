"use strict";

const { join } = require("path");
const mqttusvc = require("mqtt-usvc");
const { existsSync, readFileSync, writeFileSync } = require("fs");

const service = mqttusvc.create();

const { devices, profiles, dataPath } = service.config;

const profilesMap = profiles.reduce((obj, profile) => {
  obj[profile.id] = profile;
  return obj;
}, {});

const devicesMap = devices.reduce((obj, device) => {
  obj[device.id] = device;
  return obj;
}, {});

const stateJsonPathFull = join(__dirname, dataPath, "state.json");
let state = existsSync(stateJsonPathFull)
  ? JSON.parse(readFileSync(stateJsonPathFull, "utf8"))
  : {};

devices.forEach(d => {
  const { id } = d;
  if (state[id]) return;
  console.log(">>>", id);
  state[id] = { temperature: 20, mode: "off" };
});

console.log(devices);
// console.log(devicesMap);
// console.log(profilesMap);
console.log("STATE", state);

console.info(
  `Loaded ${devices.length} devices and ${profiles.length} profiles.`
);

service.on("message", (topic, data) => {
  console.log(topic, data);
  if (topic.startsWith("set/")) {
    const [_, deviceId, action] = topic.split("/");
    console.log("SET DEVICE", deviceId, action, data);
    const device = devicesMap[deviceId];
    if (!device) return;

    const profile = profilesMap[device.profile];
    if (!profile) return;

    const deviceState = state[device.id];
    if (action === "mode") deviceState.mode = data;
    if (action === "temperature") deviceState.temperature = Math.round(data);

    const irCommand =
      deviceState.mode === "off"
        ? profile.mode[deviceState.mode]
        : profile.mode[deviceState.mode][deviceState.temperature];

    service.send(device.topic, irCommand);
    writeFileSync(stateJsonPathFull, JSON.stringify(state), "utf8");
  }
});

service.subscribe("set/+/+");
