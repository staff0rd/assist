import { readFileSync } from "node:fs";

export function readProc(
	procRoot: string,
	pid: number,
	file: string,
): string | undefined {
	try {
		return readFileSync(`${procRoot}/${pid}/${file}`, "utf8");
	} catch {
		return undefined;
	}
}
