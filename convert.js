"use strict";
/*
function noop(...arg: unknown[]): any{
    return
}
process.stdout.write = noop
process.stderr.write = noop*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const png_itxt_1 = __importDefault(require("png-itxt"));
const fs_1 = __importDefault(require("fs"));
const dialog_1 = __importDefault(require("dialog"));
const temp_1 = require("temp");
const path_1 = __importDefault(require("path"));
const replace = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "data", "mode"));
function handleError(err) {
    console.error(err);
    dialog_1.default.err("[" + err.name + "] " + err.message);
}
function transferDMIData(dmipath, pngpath) {
    try {
        fs_1.default.createReadStream(dmipath)
            .on("error", handleError)
            .pipe(png_itxt_1.default.get("Description", (err, data) => {
            if (err) {
                handleError(err);
                return;
            }
            if (!data) {
                console.error("Source DMI file not valid!");
                dialog_1.default.err("Source DMI file not valid!");
                return;
            }
            if (pngpath) {
                try {
                    const dst = replace ? dmipath : temp_1.path({ suffix: ".dmi" });
                    fs_1.default.createReadStream(pngpath)
                        .on("error", handleError)
                        .pipe(png_itxt_1.default.set(data))
                        .pipe(fs_1.default.createWriteStream(dst))
                        .on("close", () => {
                        try {
                            fs_1.default.unlinkSync(pngpath);
                            if (!replace) {
                                fs_1.default.renameSync(dst, pngpath);
                            }
                        }
                        catch (err) {
                            handleError(err);
                        }
                    });
                }
                catch (err) {
                    handleError(err);
                }
            }
        }));
    }
    catch (err) {
        handleError(err);
    }
}
exports.transferDMIData = transferDMIData;
//# sourceMappingURL=convert.js.map