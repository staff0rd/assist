import type { OutcomeReport } from "./OutcomeReport";

export function reportOutcome({ exitCode, message }: OutcomeReport): void {
	if (exitCode === 0) console.log(message);
	else console.error(message);
}
