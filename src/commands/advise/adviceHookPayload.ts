import { adviceContextFor } from "./adviceContextFor";
import { composeAdvice } from "./composeAdvice";

type AdviceHookPayload = {
	hookSpecificOutput: {
		hookEventName: "SessionStart";
		additionalContext: string;
	};
};

export function adviceHookPayload(cwd: string): AdviceHookPayload | undefined {
	const markdown = composeAdvice(adviceContextFor(cwd));
	if (!markdown) return undefined;
	return {
		hookSpecificOutput: {
			hookEventName: "SessionStart",
			additionalContext: markdown,
		},
	};
}
