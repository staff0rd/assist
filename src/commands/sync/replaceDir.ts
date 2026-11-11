import * as fs from "node:fs";

export function replaceDir(source: string, target: string): void {
	fs.rmSync(target, { recursive: true, force: true });
	fs.cpSync(source, target, { recursive: true });
}
