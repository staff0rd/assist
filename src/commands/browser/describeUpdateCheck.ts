import type { BrowserRelayReply } from "../extension/browserLink/types";

type UpdateCheckOutcome =
	| { outcome: "updating"; message: string }
	| { outcome: "current"; message: string }
	| { outcome: "failed"; message: string };

export function describeUpdateCheck(
	reply: BrowserRelayReply<"update">,
): UpdateCheckOutcome {
	const installed = `v${reply.version}`;
	if (!reply.ok) return { outcome: "failed", message: reply.error };
	const { status, available } = reply.result;
	if (status === "update_available")
		return {
			outcome: "updating",
			message: `updating ${installed} → ${available ? `v${available}` : "a newer version"}…`,
		};
	if (status === "no_update")
		return {
			outcome: "current",
			message: `already up to date (${installed})`,
		};
	return {
		outcome: "failed",
		message: `Firefox did not check for an update (status: ${status}); still ${installed}`,
	};
}
