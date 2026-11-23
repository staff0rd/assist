import { formatItemId } from "../../../backlog/formatItemId";

export function resumeItemPrompt(itemId: number): string {
	const id = formatItemId(itemId);
	return `Resume backlog item ${id}: an earlier autopilot run started it but it stalled before it was done. Run \`assist backlog run ${id}\` and see it through to done.`;
}
