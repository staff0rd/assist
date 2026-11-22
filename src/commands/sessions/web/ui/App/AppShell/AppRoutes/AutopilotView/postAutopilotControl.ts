import { postJson } from "../../../postJson";
import { withNode } from "../../../../withNode";

export type AutopilotAction = "pause" | "resume" | "run";

export async function postAutopilotControl(
	cwd: string,
	action: AutopilotAction,
	node?: string,
): Promise<void> {
	await postJson(
		withNode("/api/autopilot/control", node),
		{ cwd, action },
		`Failed to ${action} autopilot`,
	);
}
