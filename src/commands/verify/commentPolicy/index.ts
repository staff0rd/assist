import { loadConfig } from "../../../shared/loadConfig";
import { findAddedComments } from "./findAddedComments";

const DEFAULT_MARKERS = ["HACK:", "why:"];

export function commentPolicy(): void {
	const config = loadConfig().commentPolicy;
	const markers = config?.markers ?? DEFAULT_MARKERS;
	const ignoreGlobs = config?.ignore ?? [];

	const findings = findAddedComments({ markers, ignoreGlobs });

	if (findings.length === 0) {
		console.log("No undocumented comments on changed lines.");
		process.exit(0);
	}

	console.log("Comments added on changed lines:\n");

	for (const { file, line, text } of findings) {
		console.log(`${file}:${line} → ${text}`);
	}

	console.log(`\nTotal: ${findings.length} comment(s)`);
	console.log(
		"\nDon't comment standard logic or syntax — only unintuitive complexity or a hack.",
	);
	console.log("Prefer self-documenting code.");
	console.log(
		`Remove each comment, or justify it inline with a ${markers
			.map((m) => `'${m}'`)
			.join(" or ")} marker.`,
	);
	process.exit(1);
}
