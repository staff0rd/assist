import { buildPrsStatusReport } from "./status/buildPrsStatusReport";
import { printPrsStatus } from "./status/printPrsStatus";
import type { PrsStatusOptions } from "./status/types";

export function prsStatus(repos: string[], options: PrsStatusOptions): void {
	const report = buildPrsStatusReport(repos);

	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}
	printPrsStatus(report);
}
