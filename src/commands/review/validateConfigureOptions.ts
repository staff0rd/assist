import { parseRepoScopeFlag } from "../config/parseRepoScopeFlag";
import type { ReviewOptions } from "./ReviewOptions";

export function validateConfigureOptions(options: ReviewOptions): void {
	if (!options.configure) {
		if (options.scope || (options.answer ?? []).length > 0) {
			console.error("Error: --scope and --answer require --configure.");
			process.exit(1);
		}
		return;
	}
	if (!options.highLevel) {
		console.error("Error: --configure requires --high-level.");
		process.exit(1);
	}
	if (options.number) {
		console.error("Error: --configure takes no PR number.");
		process.exit(1);
	}
	if (options.scope && !parseRepoScopeFlag(options.scope)) {
		console.error("Error: --scope must be 'git' or 'db'.");
		process.exit(1);
	}
}
