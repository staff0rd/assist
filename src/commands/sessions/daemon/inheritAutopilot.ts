import type { Session } from "./createSession";

export function inheritAutopilot(
	d: Record<string, unknown>,
	lookup: (id: string) => Session | undefined,
): void {
	const parentId = d.autopilotFrom;
	if (typeof parentId !== "string") return;
	delete d.autopilotFrom;
	const autopilot = lookup(parentId)?.autopilot;
	if (autopilot) d.autopilot = autopilot;
}
