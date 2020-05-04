"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const convert_1 = require("./convert");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dmipath = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "data", "marked"));
convert_1.transferDMIData(dmipath, process.argv[2]);
//# sourceMappingURL=convertmanual.js.map