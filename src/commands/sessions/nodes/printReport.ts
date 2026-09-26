import chalk from "chalk";
import type { LinkDiagnosis } from "./DoctorProbes";
import type { LinkSuggestion } from "./findUnlinkedWindowsNode";

type DoctorReport = {
	local: string;
	links: LinkDiagnosis[];
	suggestion?: LinkSuggestion;
};

export function printReport(report: DoctorReport): void {
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
		console.log(`  ${mark} ${hop.hop.padEnd(6)} ${hop.detail ?? hop.error}`);
		if (hop.remediation) console.log(`    ${chalk.yellow(hop.remediation)}`);
	}
}
