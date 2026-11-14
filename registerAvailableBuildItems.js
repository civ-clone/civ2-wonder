"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AvailableCityBuildItemsRegistry_1 = require("@civ-clone/core-city-build/AvailableCityBuildItemsRegistry");
const wonderTable_1 = require("./lib/wonderTable");
AvailableCityBuildItemsRegistry_1.instance.register(...wonderTable_1.wonderTypes);
//# sourceMappingURL=registerAvailableBuildItems.js.map