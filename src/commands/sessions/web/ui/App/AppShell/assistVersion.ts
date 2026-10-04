declare const __ASSIST_VERSION__: string;

export const assistVersion =
	typeof __ASSIST_VERSION__ === "undefined" ? "" : __ASSIST_VERSION__;
