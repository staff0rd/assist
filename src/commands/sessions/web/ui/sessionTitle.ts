import type { SessionInfo } from "./types";

export function sessionTitle(session: SessionInfo): string {
	const { activity } = session;
	if (session.title) return session.title;
	if (activity?.kind === "backlog") {
		return activity.itemName ?? session.name;
	}
	if (session.assistArgs?.[0] === "refine" && activity?.itemName) {
		return activity.itemName;
	}
	switch (session.commandType) {
		case "assist":
			return (
				assistPrompt(session.assistArgs) ??
				session.assistArgs?.[0] ??
				session.name
			);
		case "run":
			return session.runName ? `run: ${session.runName}` : session.name;
		default:
			return session.name;
	}
}

// The prompt text (when the user entered one) is the trailing non-flag arg,
// e.g. ["draft", "--once", "add dark mode"] -> "add dark mode"
function assistPrompt(args?: string[]): string | undefined {
	const rest = args?.slice(1).filter((a) => !a.startsWith("--"));
	return rest?.[rest.length - 1];
}
