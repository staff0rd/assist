import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";

export function piExtensionsDir(): string {
	return path.join(harnesses.pi.homeDir, "extensions");
}

export function syncPiHooks(sourceDir: string): void {
	const target = piExtensionsDir();
	fs.mkdirSync(target, { recursive: true });
	const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith(".ts"));
	for (const file of files) {
		fs.copyFileSync(
			path.join(sourceDir, file),
			path.join(target, `assist-${file}`),
		);
	}
	console.log(
		`Registered ${files.length} assist extension(s) in ~/.pi/agent/extensions`,
	);
}
