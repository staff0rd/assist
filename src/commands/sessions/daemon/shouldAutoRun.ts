import type { Session } from "./createSession";

type AutoRunDecision =
	| { run: true; itemId: number }
	| { run: false; reason: string | null };

export function shouldAutoRun(session: Session): AutoRunDecision {
	if (!session.autoRun) return { run: false, reason: null };
	if (session.status !== "done")
		return {
			run: false,
			reason: `session status is "${session.status}", not "done"`,
		};
	if (session.commandType !== "assist")
		return {
			run: false,
			reason: `command type is "${session.commandType}", not "assist"`,
		};
	const cmd = session.assistArgs?.[0];
	if (cmd !== "draft" && cmd !== "bug" && cmd !== "refine")
		return {
			run: false,
			reason: `command "${cmd ?? "(none)"}" is not draft/bug/refine`,
		};
	const itemId = session.activity?.itemId;
	if (itemId == null)
		return {
			run: false,
			reason: "no itemId in activity (draft did not create an item)",
		};
	return { run: true, itemId };
}
