import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * Absolute path to the unpacked browser extension shipped alongside the CLI.
 * tsup copies the repo-root `netcap-extension` directory next to the bundled
 * entrypoint, so this resolves under `dist` for a globally-installed CLI.
 */
export function netcapExtensionDir(): string {
	return join(moduleDir, "commands", "netcap", "netcap-extension");
}
