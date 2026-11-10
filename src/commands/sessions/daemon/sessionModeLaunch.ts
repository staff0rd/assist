import { designFeature } from "../../../shared/harnessAdapters/harnessFeatures";
import { launchBlocker } from "../../../shared/harnessAdapters/launchBlocker";
import type { HarnessAdapter } from "../../../shared/harnessAdapters/types";
import { daemonLog } from "./daemonLog";
import { designSystemPromptPath } from "./designSystemPromptPath";

type SessionMode = { design?: boolean; auto?: boolean; model?: string };

type ModeLaunch = {
	appendSystemPromptFile?: string;
	auto?: boolean;
	model?: string;
};

export function sessionModeLaunch(
	adapter: HarnessAdapter,
	{ design, auto, model }: SessionMode,
): ModeLaunch {
	return model
		? { ...designLaunch(adapter, design, auto), model }
		: designLaunch(adapter, design, auto);
}

function designLaunch(
	adapter: HarnessAdapter,
	design: boolean | undefined,
	auto: boolean | undefined,
): ModeLaunch {
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
