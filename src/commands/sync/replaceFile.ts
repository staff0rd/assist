import * as fs from "node:fs";
import * as path from "node:path";

export function replaceFile(target: string, content: string): void {
	fs.mkdirSync(path.dirname(target), { recursive: true });
	// why: rm first so a symlinked target is replaced rather than written through.
	fs.rmSync(target, { force: true });
	fs.writeFileSync(target, content);
}
