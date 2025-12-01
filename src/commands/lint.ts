// Implements conventions not enforced by biomejs
import { runFileNameCheck } from "./refactor/fileNameCheck";

export function lint(): void {
	const fileNamePassed = runFileNameCheck();

	if (!fileNamePassed) {
		process.exit(1);
	}
}
