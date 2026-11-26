import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { allocateServicePorts } from "./allocateServicePorts";
import { buildInstanceEnv } from "./buildInstanceEnv";
import type { InstanceConfig } from "./InstanceConfig";
import { instanceEntryUrl } from "./instanceEntryUrl";
import { instanceProjectName } from "./instanceProjectName";
import type { InstancePlan } from "./InstancePlan";

type PlanInput = {
	config: InstanceConfig;
	repoRoot: string;
	repo: string;
	prNumber: number;
	instancesDir?: string;
	nextPort?: () => Promise<number>;
};

export async function planReviewInstance(
	input: PlanInput,
): Promise<InstancePlan & { url: string }> {
	const project = instanceProjectName(input.repo, input.prNumber);
	const worktree = join(
		input.instancesDir ?? join(homedir(), ".assist", "review-instances"),
		project,
	);
	const ports = await allocateServicePorts(
		input.config.services,
		input.nextPort,
	);
	return {
		project,
		composeFile: resolve(input.repoRoot, input.config.composeFile),
		repoRoot: input.repoRoot,
		worktree,
		env: buildInstanceEnv(input.config.services, worktree, ports),
		url: instanceEntryUrl(input.config.entry, ports),
	};
}
