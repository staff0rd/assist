import { join } from "node:path";
import { formatVideoOffset } from "./formatVideoOffset";
import type { StepVerdict } from "./StepVerdict";

const marks = { pass: "✓", fail: "✗", unsure: "?" } as const;

function videoAt(v: StepVerdict): string {
	return v.videoOffsetMs === undefined
		? ""
		: ` (video ${formatVideoOffset(v.videoOffsetMs)})`;
}

export function formatStepsSummary(
	verdicts: StepVerdict[],
	reportDir: string,
	video?: string,
): string {
	const count = (verdict: StepVerdict["verdict"]) =>
		verdicts.filter((v) => v.verdict === verdict).length;
	return [
		"Manual testing:",
		...verdicts.flatMap((v) => [
			`  ${marks[v.verdict]} ${v.step}. ${v.verdict.toUpperCase()} ${v.action}${videoAt(v)}`,
			`      ${v.note}`,
			`      ${v.screenshot}`,
		]),
		`${count("pass")} passed, ${count("fail")} failed, ${count("unsure")} unsure`,
		...(video ? [`Video: ${video}`] : []),
		`Report: ${join(reportDir, "report.json")}`,
	].join("\n");
}
