import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { expandTilde } from "../../../shared/expandTilde";
import { allocateServicePorts } from "./allocateServicePorts";
import { buildInstanceEnv } from "./buildInstanceEnv";
import type { CompanionLookup } from "./checkouts/CompanionHead";
import { companionLookup } from "./checkouts/companionLookup";
import { planInstanceCheckouts } from "./checkouts/planInstanceCheckouts";
import type { InstanceConfig } from "./InstanceConfig";
import { instanceEntryUrl } from "./instanceEntryUrl";
import { instanceProjectName } from "./instanceProjectName";
import type { InstancePlan } from "./InstancePlan";

type PlanInput = {
	config: InstanceConfig;
	repoRoot: string;
	pr: {
		repo: string;
		fullName: string;
		number: number;
		sha: string;
		body: string;
	};
	instancesDir?: string;
	nextPort?: () => Promise<number>;
	lookup?: CompanionLookup;
};

export async function planReviewInstance(
	input: PlanInput,
): Promise<InstancePlan & { url: string }> {
	const project = instanceProjectName(input.pr.repo, input.pr.number);
	const checkouts = planInstanceCheckouts({
		services: input.config.services,
		repoRoot: input.repoRoot,
		pr: input.pr,
		worktreeBase: join(
			input.instancesDir ?? join(homedir(), ".assist", "review-instances"),
			project,
		),
		lookup: input.lookup ?? companionLookup,
	});
	const ports = await allocateServicePorts(
		input.config.services,
		input.nextPort,
	);
	return {
		project,
		composeFile: resolve(input.repoRoot, expandTilde(input.config.composeFile)),
		repoRoot: input.repoRoot,
		checkouts,
		env: buildInstanceEnv(checkouts, ports),
		url: instanceEntryUrl(input.config.entry, ports),
	};
}
