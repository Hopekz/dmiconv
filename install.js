"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Registry = require("winreg");
const path = require("path");
const fs = require("fs");
const dialog_1 = __importDefault(require("dialog"));
const native_msg_box_1 = __importDefault(require("native-msg-box"));
function promisify(obj, func, errorCb = null, ...args) {
    return new Promise((resolve) => {
        args.push(function (error, ...arg) {
            if (error) {
                if (errorCb) {
                    errorCb(error);
                }
                else {
                    basic_error_handler(error);
                }
            }
            else {
                if (arg.length === 1) {
                    resolve(arg[0]);
                }
                else {
                    resolve(arg);
                }
            }
        });
        //@ts-ignore
        obj[func](...args);
    });
}
function basic_error_handler(error) {
    if (!error)
        return;
    console.error(`${error.name}: ${error.message}`);
    error_shutdown();
}
function error_shutdown() {
    console.log("Fatal error, shutting down...");
    dialog_1.default.err("Fatal error, shutting down...");
    process.exit(1);
}
function keys_missing() {
    console.log("Required registry keys missing. You must have BYOND install to use this application.");
    dialog_1.default.err("Required registry keys missing. You must have BYOND install to use this application.");
    process.exit(1);
}
const key_png_userchoice = new Registry({
    hive: Registry.HKCU,
    key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.png\\UserChoice"
});
const key_dmi_userchoice = new Registry({
    hive: Registry.HKCU,
    key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.dmi\\UserChoice"
});
const key_png_default = new Registry({
    hive: Registry.HKCR,
    key: "\\.png"
});
const key_dmi_default = new Registry({
    hive: Registry.HKCR,
    key: "\\.dmi"
});
let key_dmi;
let key_dmi_command;
let key_png_manual;
let key_png_manual_command;
(async function () {
    await promisify(key_dmi_default, "keyExists", keys_missing);
    await promisify(key_png_default, "keyExists", keys_missing);
    let dmi_userchoice = null;
    let png_userchoice = null;
    if (await promisify(key_dmi_userchoice, "valueExists", null, "ProgId")) {
        // @ts-ignore
        dmi_userchoice = (await promisify(key_dmi_userchoice, "get", null, "ProgId")).value;
    }
    if (await promisify(key_png_userchoice, "valueExists", null, "ProgId")) {
        // @ts-ignore
        png_userchoice = (await promisify(key_png_userchoice, "get", null, "ProgId")).value;
    }
    // @ts-ignore
    const dmi_default = (await promisify(key_dmi_default, "get", null, "")).value;
    // @ts-ignore
    const png_default = (await promisify(key_png_default, "get", null, "")).value;
    key_dmi = new Registry({
        hive: Registry.HKCR,
        key: `\\${dmi_userchoice ? dmi_userchoice : dmi_default}\\shell\\DMIConv.marksource`
    });
    key_dmi_command = new Registry({
        hive: Registry.HKCR,
        key: `\\${dmi_userchoice ? dmi_userchoice : dmi_default}\\shell\\DMIConv.marksource\\Command`
    });
    key_png_manual = new Registry({
        hive: Registry.HKCR,
        key: `\\${png_userchoice ? png_userchoice : png_default}\\shell\\DMIConv.manual`
    });
    key_png_manual_command = new Registry({
        hive: Registry.HKCR,
        key: `\\${png_userchoice ? png_userchoice : png_default}\\shell\\DMIConv.manual\\Command`
    });
    await promisify(key_dmi, "create");
    await promisify(key_dmi, "set", null, "", Registry.REG_SZ, "DMIConvert - Mark Source");
    await promisify(key_dmi_command, "create");
    await promisify(key_dmi_command, "set", null, "", Registry.REG_SZ, `"${process.execPath}" "${path.resolve(__dirname, "marksource.js")}" "%1"`);
    await promisify(key_png_manual, "create");
    await promisify(key_png_manual, "set", null, "", Registry.REG_SZ, "DMIConvert - Convert");
    await promisify(key_png_manual_command, "create");
    await promisify(key_png_manual_command, "set", null, "", Registry.REG_SZ, `"${process.execPath}" "${path.resolve(__dirname, "convertmanual.js")}" "%1"`);
    try {
        fs.mkdirSync(path.resolve(__dirname, "data"));
    }
    catch (e) { }
    native_msg_box_1.default.prompt({ msg: "Replace dmi file and delete png file on conversion?", title: "DMIConv Configuration" }, (err, result) => {
        switch (result) {
            case native_msg_box_1.default.Result.YES:
                fs.writeFileSync(path.resolve(__dirname, "data", "mode"), "1");
                break;
            case native_msg_box_1.default.Result.NO:
                fs.writeFileSync(path.resolve(__dirname, "data", "mode"), "0");
                break;
        }
        fs.writeFileSync(path.resolve(__dirname, "data", "marked"), "nofile, select file");
        dialog_1.default.info("Setup complete");
    });
})();
//# sourceMappingURL=install.js.map