import type { InstancePlan } from "./InstancePlan";

export function printKeptInstance(instance: InstancePlan): void {
	console.log(
		[
			`Kept ${instance.project}. Tear it down with:`,
			`  docker compose -p ${instance.project} -f ${instance.composeFile} down -v`,
			...instance.checkouts.map(
				(checkout) =>
					`  git -C ${checkout.repoRoot} worktree remove --force ${checkout.dir}`,
			),
		].join("\n"),
	);
}
