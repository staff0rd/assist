import { postJson } from "../../../postJson";
import { withNode } from "../../../../withNode";

export type AutopilotAction =
	| "pause"
	| "resume"
	| "run"
	| "stop"
	| "resume-item";

export async function postAutopilotControl(
	cwd: string,
	action: AutopilotAction,
	node?: string,
	itemId?: number,
): Promise<void> {
	await postJson(
		withNode("/api/autopilot/control", node),
		{ cwd, action, itemId },
		`Failed to ${action} autopilot`,
	);
}
