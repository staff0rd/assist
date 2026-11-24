/** What a backlog run started by an autopilot run owes the schedule's next tick. */
export function autopilotRunContract(nextTickAt: string, item: string): string {
	return [
		`This backlog run was started by an autopilot run. The schedule's tick is its observation loop: each tick judges the last item's prediction against live state, and this run is a worker. The next tick runs at ${nextTickAt}.`,
		"- Short waits that are part of the work are fine, e.g. a deploy settling or a minutes-long smoke check.",
		`- A check that can't be made before ${nextTickAt} belongs to that tick, not to this run. Record it in an item comment for the tick, e.g. \`assist backlog comment ${item} "Check at <time>: <what to check and the expected result>"\`, instead of waiting or sleeping in the background for it.`,
		"- Handing a check to the tick counts as the user's instruction to complete: once every check you can't make before the next tick is recorded, run the completion steps, finish the item and end. Don't keep the item open for a check handed to the tick.",
	].join("\n");
}
