export function printKeptInstance(instance: {
	project: string;
	composeFile: string;
	worktree: string;
}): void {
	console.log(
		[
			`Kept ${instance.project}. Tear it down with:`,
			`  docker compose -p ${instance.project} -f ${instance.composeFile} down -v`,
			`  git worktree remove --force ${instance.worktree}`,
		].join("\n"),
	);
}
