import { loadConfigFrom } from "../../../../shared/loadConfigFrom";

export type AutopilotTarget = {
	cwd: string;
	prompt: string;
	intervalMinutes: number;
	node?: string;
	scheduledHere: boolean;
};

export function readAutopilotTarget(
	cwd: string,
	localNode: string,
): AutopilotTarget | undefined {
	const autopilot = loadConfigFrom(cwd).autopilot;
	const prompt = autopilot?.prompt?.trim();
	if (!prompt || !autopilot?.intervalMinutes) return undefined;
	const node = autopilot.node?.trim() || undefined;
	return {
		cwd,
		prompt,
		intervalMinutes: autopilot.intervalMinutes,
		node,
		scheduledHere: node === localNode,
	};
}
