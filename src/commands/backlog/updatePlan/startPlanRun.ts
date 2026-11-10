import chalk from "chalk";
import { expandTilde } from "../../../shared/expandTilde";
import { loadConfig } from "../../../shared/loadConfig";
import { formatItemId } from "../formatItemId";
import { startProposedRun } from "../propose/startProposedRun";
import type { StartApproval } from "../propose/toStartApproval";
import { resolveRepoLocation } from "../resolveRepoLocation";
import { getOrigin } from "../shared";
import type { BacklogItem } from "../types";

function itemRepoCwd(origin: string | undefined): string | undefined {
	if (!origin || origin === getOrigin()) return process.cwd();
	const baseDir = expandTilde(loadConfig().clone.baseDir);
	return resolveRepoLocation(origin, undefined, baseDir).cwd;
}

export async function startPlanRun(
	item: BacklogItem,
	approval: StartApproval,
): Promise<void> {
	if (!approval.autostart) return;
	if (approval.startOn) return startProposedRun(item.id, approval.startOn);
	const cwd = itemRepoCwd(item.origin);
	if (!cwd) {
		console.log(
			chalk.yellow(
				`Not starting a run: no clone of ${item.origin} was found. Run \`assist backlog run ${formatItemId(item.id)}\` from a clone of it.`,
			),
		);
		return;
	}
	await startProposedRun(item.id, undefined, cwd);
}
