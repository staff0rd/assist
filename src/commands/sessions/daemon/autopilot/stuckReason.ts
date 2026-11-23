import type { AutopilotIdleMember } from "./AutopilotDeps";

export function stuckReason(member: AutopilotIdleMember): string {
	const asked = member.lastMessage?.trim().split("\n").pop()?.slice(0, 160);
	return `its session is waiting for a chat reply autopilot cannot give${asked ? `: "${asked}"` : ""}`;
}
