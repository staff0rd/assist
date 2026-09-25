import type { ReleaseNodeState } from "../../../../../../../releases/types";
import {
	keepLeadAndNonEmpty,
	type ReleasePill,
	releasePill,
} from "../releasePill";

export function releaseRunPills(
	environments: ReleaseNodeState[],
): ReleasePill[] {
	const withStatus = (status: string) =>
		environments.filter((node) => node.run?.status === status);
	const deployed = withStatus("ok");
	const gated = withStatus("gate");
	const failed = withStatus("fail");
	const untouched = environments.filter(
		(node) => !node.run || node.run.status === "idle",
	);
	return keepLeadAndNonEmpty([
		releasePill(
			"ok",
			`${deployed.length} of ${environments.length} deployed by this run`,
			deployed,
		),
		releasePill("gate", `${gated.length} stopped at an approval gate`, gated),
		releasePill("fail", `${failed.length} failed in this run`, failed),
		releasePill(
			"idle",
			`${untouched.length} this run never touched`,
			untouched,
		),
	]);
}
