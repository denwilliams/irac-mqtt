# IR Air Conditioner Controller via MQTT

Control Air Conditioners using IR via an MQTT-to-IR-Blaster type bridge, eg [https://github.com/denwilliams/xiaomi-uir-mqtt](https://github.com/denwilliams/xiaomi-uir-mqtt)

This is a pretty simple service that receives a "set" command via MQTT, maps it to an IR command and publishes to the blaster, then publishes a status update.
