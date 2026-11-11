import * as fs from "node:fs";
import * as path from "node:path";
import { piExtensionsDir } from "../../commands/sync/syncPiHooks";
import type { CapabilityStatus } from "./types";
import { supported, unsupported } from "./unsupported";

export function piExtensionProbe(): CapabilityStatus {
	const extension = path.join(piExtensionsDir(), "assist-permission-gate.ts");
	return fs.existsSync(extension)
		? supported
		: unsupported(
				`assist's pi extension is not installed (${extension} is missing), so pi tool calls would bypass the allowlist, restricted paths and docs/schema locks`,
				"run `assist sync` to install the extension, or pick another harness",
			);
}
