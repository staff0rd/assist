import type { HarnessKind } from "../../../../shared/harnesses";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";

const claudeEngines = new Set<HarnessKind | undefined>([
	undefined,
	"claude",
	"claude-sdk",
]);

/* why: a Claude transcript doesn't record whether it ran in a terminal or the
 * SDK, so history reports it as "claude"; resume it with the configured engine. */
export function resumeHarness(
	harness: HarnessKind | undefined,
	cwd: string,
): HarnessKind | undefined {
	if (!claudeEngines.has(harness)) return harness;
	const engine = loadConfigFrom(cwd).harness.engine;
	return claudeEngines.has(engine) ? engine : harness;
}
