import { type HarnessKind, harnesses } from "../../../../shared/harnesses";
import { resolveHarness } from "../../../../shared/harnessAdapters/harnessLabel";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";

/* why: a transcript doesn't record whether it ran in a terminal or the SDK, so
 * history reports the CLI's harness; resume it with the configured engine when
 * that engine drives the same CLI. */
export function resumeHarness(
	harness: HarnessKind | undefined,
	cwd: string,
): HarnessKind | undefined {
	const engine = loadConfigFrom(cwd).harness.engine;
	const command = harnesses[resolveHarness(harness)]?.command;
	return command && harnesses[engine]?.command === command ? engine : harness;
}
