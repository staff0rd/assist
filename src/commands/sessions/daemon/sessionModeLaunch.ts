import { designFeature } from "../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../shared/harnessAdapters/launchBlocker";
import type { HarnessAdapter } from "../../../shared/harnessAdapters/types";
import { daemonLog } from "./daemonLog";
import { designSystemPromptPath } from "./designSystemPromptPath";

type SessionMode = { design?: boolean; auto?: boolean };

export function sessionModeLaunch(
	adapter: HarnessAdapter,
	{ design, auto }: SessionMode,
): { appendSystemPromptFile?: string; auto?: boolean } {
	if (!design) return { auto };
	const blocker = launchBlocker(adapter, designFeature);
	if (blocker) {
		daemonLog(
			`design: launching without the design prompt, ${blocker.replaceAll("\n", " ")}`,
		);
		return { auto };
	}
	return { appendSystemPromptFile: designSystemPromptPath(), auto: true };
}
