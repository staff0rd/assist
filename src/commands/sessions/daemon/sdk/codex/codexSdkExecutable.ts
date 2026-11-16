import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { codexIsolatedHookArgs } from "../../../../../shared/codexIsolatedHookArgs";
import { harnesses } from "../../../../../shared/harnesses";

/* why: the Codex SDK spawns `<executable> exec ...` and offers no way to pass a
 * top-level flag such as --no-daemon, so a shim on POSIX runs the codex on PATH
 * (the one whose hooks assist trusts) with those flags first. Windows can't
 * spawn a shell shim without a shell, so it falls back to the SDK's bundled
 * codex binary. */
export function codexSdkExecutable(): string | undefined {
	if (process.platform === "win32") return undefined;
	const dir = join(homedir(), ".assist", "codex-sdk");
	mkdirSync(dir, { recursive: true });
	const shim = join(dir, "codex");
	const args = [harnesses.codex.command, ...codexIsolatedHookArgs()].join(" ");
	writeFileSync(shim, `#!/bin/sh\nexec ${args} "$@"\n`);
	chmodSync(shim, 0o755);
	return shim;
}
