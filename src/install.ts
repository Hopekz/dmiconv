export {};
import Registry = Winreg.Registry

const Registry = require("winreg");
const path = require("path")
const fs = require("fs")
import dialog from "dialog"
import prompt from "native-msg-box"

function promisify(obj: Registry, func: string, errorCb: null | Function = null, ...args: Array<unknown>): Promise<Array<unknown>> | Promise<unknown>{
    return new Promise((resolve) => {
        args.push(function (error: Error, ...arg: Array<unknown>) {
            if(error){
                if(errorCb) {
                    errorCb(error)
                }else {
                    basic_error_handler(error)
                }
            }else {
                if(arg.length === 1){
                    resolve(arg[0])
                }else{
                    resolve(arg)
                }
            }
        })
        //@ts-ignore
        obj[func](...args)
    });
}

function basic_error_handler(error: Error): void{
    if(!error) return;
    console.error(`${error.name}: ${error.message}`);
    error_shutdown()
}

function error_shutdown(){
    console.log("Fatal error, shutting down...");
    dialog.err("Fatal error, shutting down...")
    process.exit(1)
}

function keys_missing() {
    console.log("Required registry keys missing. You must have BYOND install to use this application.")
    dialog.err("Required registry keys missing. You must have BYOND install to use this application.")

    process.exit(1)
}

const key_png_userchoice = new Registry({
    hive: Registry.HKCU,
    key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.png\\UserChoice"
})
const key_dmi_userchoice = new Registry({
    hive: Registry.HKCU,
    key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.dmi\\UserChoice"
})
const key_png_default = new Registry({
    hive: Registry.HKCR,
    key: "\\.png"
})
const key_dmi_default = new Registry({
    hive: Registry.HKCR,
    key: "\\.dmi"
})
let key_dmi: Registry
let key_dmi_command: Registry
let key_png_manual: Registry
let key_png_manual_command: Registry

(async function() {
    await promisify(key_dmi_default, "keyExists", keys_missing)
    await promisify(key_png_default, "keyExists", keys_missing)

    let dmi_userchoice: string | null = null
    let png_userchoice: string | null = null

    if(await promisify(key_dmi_userchoice, "valueExists", null, "ProgId")){
        // @ts-ignore
        dmi_userchoice = (await promisify(key_dmi_userchoice, "get", null, "ProgId")).value
    }
    if(await promisify(key_png_userchoice, "valueExists", null, "ProgId")){
        // @ts-ignore
        png_userchoice = (await promisify(key_png_userchoice, "get", null, "ProgId")).value
    }

    // @ts-ignore
    const dmi_default = (await promisify(key_dmi_default, "get", null, "")).value
    // @ts-ignore
    const png_default = (await promisify(key_png_default, "get", null, "")).value

    key_dmi = new Registry({
        hive: Registry.HKCR,
        key: `\\${dmi_userchoice ? dmi_userchoice : dmi_default}\\shell\\DMIConv.marksource`
    })
    key_dmi_command = new Registry({
        hive: Registry.HKCR,
        key: `\\${dmi_userchoice ? dmi_userchoice : dmi_default}\\shell\\DMIConv.marksource\\Command`
    })
    key_png_manual = new Registry({
        hive: Registry.HKCR,
        key: `\\${png_userchoice ? png_userchoice : png_default}\\shell\\DMIConv.manual`
    })
    key_png_manual_command = new Registry({
        hive: Registry.HKCR,
        key: `\\${png_userchoice ? png_userchoice : png_default}\\shell\\DMIConv.manual\\Command`
    })
    await promisify(key_dmi, "create")
    await promisify(key_dmi, "set", null, "", Registry.REG_SZ, "DMIConvert - Mark Source")
    await promisify(key_dmi_command, "create")
    await promisify(key_dmi_command, "set", null, "", Registry.REG_SZ, `"${process.execPath}" "${path.resolve(__dirname, "marksource.js")}" "%1"`)
    await promisify(key_png_manual, "create")
    await promisify(key_png_manual, "set", null, "", Registry.REG_SZ, "DMIConvert - Convert")
    await promisify(key_png_manual_command, "create")
    await promisify(key_png_manual_command, "set", null, "", Registry.REG_SZ, `"${process.execPath}" "${path.resolve(__dirname, "convertmanual.js")}" "%1"`)

    try{
        fs.mkdirSync(path.resolve(__dirname, "data"))
    }catch(e){}


    prompt.prompt({msg: "Replace dmi file and delete png file on conversion?", title: "DMIConv Configuration"}, (err: Error, result: number) => {
        switch (result){
            case prompt.Result.YES:
                fs.writeFileSync(path.resolve(__dirname, "data", "mode"), "1");
                break
            case prompt.Result.NO:
                fs.writeFileSync(path.resolve(__dirname, "data", "mode"), "0");
                break
        }
        fs.writeFileSync(path.resolve(__dirname, "data", "marked"), "nofile, select file");
        dialog.info("Setup complete")
    })

})()