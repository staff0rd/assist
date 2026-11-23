import { resolveNodeName } from "../../shared/resolveNodeName";
import { listAutopilotTargets } from "../../daemon/autopilot/listAutopilotTargets";

export function autopilotRepos(): string[] {
	return listAutopilotTargets(resolveNodeName()).map((target) => target.cwd);
}
