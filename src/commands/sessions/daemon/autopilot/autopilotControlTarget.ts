import {
	type AutopilotTarget,
	readAutopilotTarget,
} from "./readAutopilotTarget";

export function autopilotControlTarget(
	cwd: string,
	localNode: string,
): { target: AutopilotTarget } | { error: string } {
	const target = readAutopilotTarget(cwd, localNode);
	if (!target) return { error: `autopilot is not configured for ${cwd}` };
	if (target.scheduledHere) return { target };
	return {
		error: target.node
			? `autopilot for ${cwd} runs on ${target.node}, not ${localNode}`
			: `autopilot.node is unset for ${cwd}, so no node runs it`,
	};
}
