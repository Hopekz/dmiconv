/*
function noop(...arg: unknown[]): any{
	return
}
process.stdout.write = noop
process.stderr.write = noop*/

import {PathLike} from "fs"
import png from "png-itxt"
import fs from "fs"
import dialog from "dialog"
import {path as tempPath} from "temp"
import path from "path"

const replace = fs.readFileSync(path.resolve(__dirname, "data", "mode"));

function handleError(err: Error){
	console.error(err)
	dialog.err("[" + err.name + "] " + err.message)
}
export function transferDMIData(dmipath: PathLike, pngpath: PathLike): void{
	try {
		fs.createReadStream(dmipath)
			.on("error", handleError)
			.pipe(png.get("Description", (err: Error, data: PNGMetadata) => {
				if (err) {
					handleError(err)
					return
				}
				if (!data) {
					console.error("Source DMI file not valid!")
					dialog.err("Source DMI file not valid!")
					return
				}
				if (pngpath) {
					try {
						const dst = replace ? dmipath : tempPath({suffix: ".dmi"})
						fs.createReadStream(pngpath)
							.on("error", handleError)
							.pipe(png.set(data))
							.pipe(fs.createWriteStream(dst))
							.on("close", () => {
								try{
									fs.unlinkSync(pngpath)
									if(!replace) {
										fs.renameSync(dst, pngpath)
									}
								}catch(err){
									handleError(err)
								}
							})
					}catch(err){
						handleError(err)
					}
				}
			}))
	}catch(err){
		handleError(err)
	}
}