import { loadConfig } from "../../../shared/loadConfig";
import { findComments } from "./findComments";

export function blockComments(): void {
	const ignoreGlobs = loadConfig().blockComments?.ignore ?? [];

	const findings = findComments({ ignoreGlobs });

	if (findings.length === 0) {
		console.log("No comments on changed lines.");
		process.exit(0);
	}

	console.log("Comments on changed lines:\n");

	for (const { file, line, text } of findings) {
		console.log(`${file}:${line} → ${text}`);
	}

	console.log(`\nTotal: ${findings.length} comment(s)`);
	console.log(
		"\nEvery comment on a changed line fails this gate, whether you added or edited it. Remove them and let the code document itself.",
	);
	process.exit(1);
}
