import { writeFileSync } from "node:fs";
import { gitFailureReason } from "./gitFailureReason";
import { runGit } from "./resolveUpstream";
import { simulatedDivergencePath } from "./simulatedDivergencePath";

export function simulateDivergence(): void {
	try {
		writeFileSync(simulatedDivergencePath(), "");
		console.log(
			`the next assist watch wait poll in ${runGit(["rev-parse", "--show-toplevel"])} will exit 3 as a simulated divergence`,
		);
	} catch (error) {
		console.error(`cannot simulate a divergence: ${gitFailureReason(error)}`);
		process.exit(1);
	}
}
