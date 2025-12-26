"use strict";
const mitt = require("mitt");
const mainEventBus = mitt();
exports.m = mainEventBus;
