import {transferDMIData} from "./convert"

export {};
import fs from "fs"
import path from "path"

const dmipath = fs.readFileSync(path.resolve(__dirname, "data", "marked"));
transferDMIData(dmipath, process.argv[2])