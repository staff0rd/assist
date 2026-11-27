import { exitWithError } from "../exitWithError";
import type { InstanceConfig } from "../InstanceConfig";
import type { InstanceAuth } from "./InstanceAuth";
import { resolveInstanceAuth } from "./resolveInstanceAuth";

export function requireInstanceAuth(
	config: InstanceConfig,
	repoRoot: string,
): InstanceAuth | undefined {
	try {
		return resolveInstanceAuth(config.auth, repoRoot);
	} catch (error) {
		return exitWithError((error as Error).message);
	}
}
