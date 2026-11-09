import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { sessionFeature } from "../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../shared/harnessAdapters/launchBlocker";
import type { HarnessKind } from "../../../shared/harnesses";
import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";
import { spawnContextFrom } from "./spawnContextFrom";

function sessionBlocker(harness: HarnessKind | undefined): string | undefined {
	return launchBlocker(harnessAdapter(harness), sessionFeature);
}

export function spawnCreate(
	m: SessionManager,
	d: Record<string, unknown>,
): string | { error: string } {
	const design = d.design === true;
	const harness = d.harness as HarnessKind | undefined;
	const prompt = d.prompt as string | undefined;
	const auto = d.auto === true;
	if (design)
		daemonLog(`create: design session (cwd=${(d.cwd as string) ?? ""})`);
	if (harness)
		daemonLog(`create: ${harness} session (cwd=${(d.cwd as string) ?? ""})`);
	const joinSessionId = design
		? undefined
		: (d.joinSessionId as string | undefined);
	if (joinSessionId) {
		const joined = m.addAgent(joinSessionId, { prompt, harness, auto });
		if ("sessionId" in joined) return joined.sessionId;
		return { error: `Can't add an agent: ${joined.reason}.` };
	}
	const blocker = sessionBlocker(harness);
	if (blocker) {
		daemonLog(`create: refused, ${blocker.replaceAll("\n", " ")}`);
		return { error: blocker };
	}
	return m.spawn(
		{
			prompt,
			cwd: d.cwd as string | undefined,
			design,
			auto,
			harness,
			inPlace: d.inPlace === true,
		},
		spawnContextFrom(d),
	);
}
