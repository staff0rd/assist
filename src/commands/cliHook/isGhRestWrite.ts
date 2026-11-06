const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const METHOD = /(?:-X|--method)[\s=]*["']?([A-Za-z]+)/g;
const BODY_FLAG = /\s(?:-[fF]|--field|--raw-field|--input)/;

export function isGhRestWrite(command: string, endpoint: RegExp): boolean {
	if (!/gh\s+api/.test(command) || !endpoint.test(command)) return false;
	const methods = [...command.matchAll(METHOD)].map((m) => m[1].toUpperCase());
	if (methods.length > 0) return methods.some((m) => WRITE_METHODS.has(m));
	return BODY_FLAG.test(command);
}
