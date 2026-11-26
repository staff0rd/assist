import { join } from "node:path";
import type { StepVerdict } from "./StepVerdict";

const marks = { pass: "✓", fail: "✗", unsure: "?" } as const;

export function formatStepsSummary(
	verdicts: StepVerdict[],
	reportDir: string,
): string {
	const count = (verdict: StepVerdict["verdict"]) =>
		verdicts.filter((v) => v.verdict === verdict).length;
	return [
		"Manual testing:",
		...verdicts.flatMap((v) => [
			`  ${marks[v.verdict]} ${v.step}. ${v.verdict.toUpperCase()} ${v.action}`,
			`      ${v.note}`,
			`      ${v.screenshot}`,
		]),
		`${count("pass")} passed, ${count("fail")} failed, ${count("unsure")} unsure`,
		`Report: ${join(reportDir, "report.json")}`,
	].join("\n");
}
