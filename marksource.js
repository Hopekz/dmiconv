"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
fs.writeFileSync(path.resolve(__dirname, "data", "marked"), process.argv[2]);
//# sourceMappingURL=marksource.js.map