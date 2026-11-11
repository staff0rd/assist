import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";
import { retiredSyncNames } from "./retiredSyncNames";

// Syncs before the ownership manifest recorded nothing, so files they wrote
// under names assist has since retired are claimed here to let prune remove them.
export function retiredOwnedPaths(): string[] {
	const { claude, codex, pi } = harnesses;
	const paths = retiredSyncNames.commands.flatMap((name) => [
		path.join(claude.homeDir, "commands", `${name}.md`),
		path.join(claude.homeDir, claude.sync.commandDest(name)),
		path.join(codex.homeDir, codex.sync.commandDest(name)),
		path.join(pi.homeDir, pi.sync.commandDest(name)),
	]);
	for (const name of retiredSyncNames.skillDirs)
		paths.push(
			path.join(claude.homeDir, "skills", name),
			path.join(codex.homeDir, "skills", name),
		);
	return paths.filter((file) => fs.existsSync(file));
}
