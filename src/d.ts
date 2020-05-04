declare module "png-itxt"
declare type PNGMetadata = {
	type: string,
	keyword: string,
	value: string,
	language: string,
	translated: string,
	compressed: boolean,
	compression_type: number
}

declare module "dialog"
declare module "native-msg-box"