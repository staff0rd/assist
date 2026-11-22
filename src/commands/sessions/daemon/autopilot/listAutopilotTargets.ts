import { expandTilde } from "../../../../shared/expandTilde";
import { loadConfig } from "../../../../shared/loadConfig";
import { listClones } from "../../web/fromGithub/listClones";
import { daemonLog } from "../daemonLog";
import {
	type AutopilotTarget,
	readAutopilotTarget,
} from "./readAutopilotTarget";

const failing = new Set<string>();

export function listAutopilotTargets(localNode: string): AutopilotTarget[] {
	const targets: AutopilotTarget[] = [];
	for (const cwd of listClones(expandTilde(loadConfig().clone.baseDir))) {
		try {
			const target = readAutopilotTarget(cwd, localNode);
			failing.delete(cwd);
			if (target) targets.push(target);
		} catch (error) {
			if (!failing.has(cwd))
				daemonLog(`autopilot: reading ${cwd} config failed: ${String(error)}`);
			failing.add(cwd);
		}
	}
	return targets;
}
