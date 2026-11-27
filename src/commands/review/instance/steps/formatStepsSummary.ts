import { join } from "node:path";
import { formatVideoOffset } from "./formatVideoOffset";
import type { ManualStepsResult } from "./ManualStepsResult";
import type { StepVerdict } from "./StepVerdict";

const marks = { pass: "✓", fail: "✗", unsure: "?" } as const;

function videoAt(v: StepVerdict): string {
	return v.videoOffsetMs === undefined
		? ""
		: ` (video ${formatVideoOffset(v.videoOffsetMs)})`;
}

function stepLines(v: StepVerdict): string[] {
	return [
		`  ${marks[v.verdict]} ${v.step}. ${v.verdict.toUpperCase()} ${v.action}${videoAt(v)}`,
		`      ${v.note}`,
		`      ${v.screenshot}`,
		...(v.errors ?? []).map(
			(error) => `      ! ${error.source}: ${error.message}`,
		),
	];
}

function errorTotals(result: ManualStepsResult): string[] {
	const errors = result.verdicts.reduce(
		(total, v) => total + (v.errors?.length ?? 0),
		0,
	);
	if (result.ignoredErrors === undefined && errors === 0) return [];
	return [`${errors} errors logged (${result.ignoredErrors ?? 0} ignored)`];
}

export function formatStepsSummary(
	result: ManualStepsResult,
	reportDir: string,
): string {
	const { verdicts, video } = result;
	const count = (verdict: StepVerdict["verdict"]) =>
		verdicts.filter((v) => v.verdict === verdict).length;
	return [
		"Manual testing:",
		...verdicts.flatMap(stepLines),
		`${count("pass")} passed, ${count("fail")} failed, ${count("unsure")} unsure`,
		...errorTotals(result),
		...(video ? [`Video: ${video}`] : []),
		`Report: ${join(reportDir, "report.json")}`,
	].join("\n");
}
