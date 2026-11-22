import { CHECK_RESULT_KEY } from "../shared/askCheckInputSchema";
import type { PrPreview } from "../shared/SessionInfoBase";
import { autopilotAnswers } from "./autopilotAnswers";

type AutopilotDecision = {
	autostart?: true;
	answers?: Record<string, string>;
};

export function autopilotDecision(
	preview: PrPreview,
): AutopilotDecision | undefined {
	switch (preview.kind) {
		case "backlog-item":
			return preview.canStart ? { autostart: true } : {};
		case "check":
			return { answers: { [CHECK_RESULT_KEY]: "works" } };
		case "ask":
		case "design":
			return {};
		case "question": {
			const answers = autopilotAnswers(preview.body);
			return answers ? { answers } : undefined;
		}
		default:
			return undefined;
	}
}
