import { minimatch } from "minimatch";
import type { CheckOutcome } from "./types";

const EVIDENCE_PATTERNS = [
	/!\[[^\]]*\]\([^)]+\)/g,
	/<(?:img|video)\b[^>]*>/gi,
	/https?:\/\/github\.com\/user-attachments\/assets\/\S+/g,
	/https?:\/\/\S+\.(?:png|jpe?g|gif|webp|avif|svg|mp4|mov|webm)\b/gi,
];

function countEvidence(body: string): number {
	return EVIDENCE_PATTERNS.reduce(
		(total, pattern) => total + (body.match(pattern)?.length ?? 0),
		0,
	);
}

function plural(count: number, noun: string): string {
	return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function checkUiEvidence(
	body: string,
	changedFiles: string[],
	uiPaths: string[],
): CheckOutcome {
	if (uiPaths.length === 0)
		return {
			status: "pass",
			reason:
				"review.highLevel.uiPaths is unset, so no UI evidence is required",
		};
	const touched = changedFiles.filter((file) =>
		uiPaths.some((glob) => minimatch(file, glob)),
	);
	if (touched.length === 0)
		return {
			status: "pass",
			reason: "no changed file matches review.highLevel.uiPaths",
		};
	const evidence = countEvidence(body);
	if (evidence === 0)
		return {
			status: "fail",
			reason: `${plural(touched.length, "UI file")} changed (${touched[0]}) but no screenshot or video in the description`,
		};
	const shown =
		evidence === 1
			? "1 screenshot or video"
			: `${evidence} screenshots or videos`;
	return {
		status: "pass",
		reason: `${shown} for ${plural(touched.length, "changed UI file")}`,
	};
}
