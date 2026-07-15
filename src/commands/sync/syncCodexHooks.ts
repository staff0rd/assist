import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";

const BEGIN = "# >>> assist codex hooks (managed) — do not edit >>>";
const END = "# <<< assist codex hooks (managed) <<<";

export function upsertManagedBlock(existing: string, body: string): string {
	const block = `${BEGIN}\n${body.trim()}\n${END}`;
	const begin = existing.indexOf(BEGIN);
	if (begin === -1) {
		const base = existing.replace(/\s*$/, "");
		return base ? `${base}\n\n${block}\n` : `${block}\n`;
	}
	const endMarker = existing.indexOf(END, begin);
	const after = endMarker === -1 ? existing.length : endMarker + END.length;
	const before = existing.slice(0, begin).replace(/\s*$/, "");
	const rest = existing.slice(after).replace(/^\s*/, "");
	const head = before ? `${before}\n\n${block}` : block;
	return rest ? `${head}\n\n${rest}\n` : `${head}\n`;
}

export function syncCodexHooks(sourcePath: string): void {
	const body = fs.readFileSync(sourcePath, "utf8");
	const configPath = path.join(harnesses.codex.homeDir, "config.toml");
	const existing = fs.existsSync(configPath)
		? fs.readFileSync(configPath, "utf8")
		: "";
	fs.mkdirSync(path.dirname(configPath), { recursive: true });
	fs.writeFileSync(configPath, upsertManagedBlock(existing, body));
	console.log(
		"Registered assist codex-hook in ~/.codex/config.toml (PreToolUse, PermissionRequest)",
	);
}
