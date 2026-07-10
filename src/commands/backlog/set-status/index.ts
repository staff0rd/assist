import chalk from "chalk";
import { formatItemId, parseItemId } from "../formatItemId";
import { setStatus } from "../shared";
import type { BacklogStatus } from "../types";

const allowedStatuses: readonly BacklogStatus[] = [
	"todo",
	"in-progress",
	"done",
	"wontdo",
];

export async function setStatusCommand(
	id: string,
	status: string,
): Promise<void> {
	if (!allowedStatuses.includes(status as BacklogStatus)) {
		console.log(
			chalk.red(
				`Invalid status "${status}". Must be one of: ${allowedStatuses.join(", ")}.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	const name = await setStatus(id, status as BacklogStatus);
	if (name) {
		console.log(
			chalk.green(
				`Set item ${formatItemId(parseItemId(id))} to ${status}: ${name}`,
			),
		);
	}
}
