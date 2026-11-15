import chalk from "chalk";
import type { NodeRuntimeReport } from "../daemon/runtime/NodeRuntimeReport";
import type { LinkDiagnosis } from "./DoctorProbes";
import { printNodeRuntime } from "./printNodeRuntime";
import type { LinkSuggestion } from "./findUnlinkedWindowsNode";

type DoctorReport = {
	local: string;
	runtime?: NodeRuntimeReport;
	links: LinkDiagnosis[];
	suggestion?: LinkSuggestion;
};

export function printReport(report: DoctorReport): void {
	console.log(chalk.bold(report.local));
	printNodeRuntime(report.local, report.runtime);
	if (report.links.length === 0) {
		console.log(`${report.local} has no links`);
		if (report.suggestion)
			console.log(
				`A Windows node (${report.suggestion.nodeName}) answers on ${report.suggestion.url} but is not linked. Link it with:\n  ${report.suggestion.command}`,
			);
		return;
	}
	for (const diagnosis of report.links) printDiagnosis(diagnosis);
}

function printDiagnosis(diagnosis: LinkDiagnosis): void {
	console.log(`${chalk.bold(diagnosis.name)} ${chalk.dim(diagnosis.url)}`);
	for (const hop of diagnosis.hops) {
		const mark = hop.ok ? chalk.green("✓") : chalk.red("✗");
		console.log(`  ${mark} ${hop.hop.padEnd(9)} ${hop.detail ?? hop.error}`);
		if (hop.remediation) console.log(`    ${chalk.yellow(hop.remediation)}`);
	}
	if (diagnosis.runtime) printNodeRuntime(diagnosis.name, diagnosis.runtime);
}
