import { chmodSync, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

let ensured = false;

// npm strips the exec bit from node-pty's prebuilt spawn-helper when
// unpacking the published tarball; macOS spawns PTY children through that
// helper, so without the bit pty.spawn throws "posix_spawnp failed."
export function ensureSpawnHelperExecutable(): void {
	if (ensured || process.platform !== "darwin") return;
	ensured = true;
	const ptyRoot = path.join(path.dirname(require.resolve("node-pty")), "..");
	const helper = path.join(
		ptyRoot,
		"prebuilds",
		`${process.platform}-${process.arch}`,
		"spawn-helper",
	);
	if (!existsSync(helper)) return;
	const mode = statSync(helper).mode;
	if ((mode & 0o111) === 0) chmodSync(helper, mode | 0o755);
}
