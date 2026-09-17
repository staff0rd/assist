import { buildPrsStatusReport } from "./buildPrsStatusReport";
import { printPrsStatus } from "./printPrsStatus";
import type { PrsStatusOptions } from "./types";

export function prsStatus(repos: string[], options: PrsStatusOptions): void {
	const report = buildPrsStatusReport(repos);

	if (options.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}
	printPrsStatus(report);
}
