import type { InstanceCheckout } from "./checkouts/InstanceCheckout";

export type InstancePlan = {
	project: string;
	composeFile: string;
	repoRoot: string;
	checkouts: InstanceCheckout[];
	env: Record<string, string>;
};
