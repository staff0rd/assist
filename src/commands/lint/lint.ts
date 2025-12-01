// Implements conventions not enforced by biomejs
import { runFileNameCheck } from "./fileNameCheck";

export function lint(): void {
	const fileNamePassed = runFileNameCheck();

	if (!fileNamePassed) {
		process.exit(1);
	}
}
