// Implements conventions not enforced by biomejs
import { runFileNameCheck } from "./runFileNameCheck";
import { runStaticImportCheck } from "./runStaticImportCheck";

export function lint(): void {
	const fileNamePassed = runFileNameCheck();
	const staticImportPassed = runStaticImportCheck();

	if (!fileNamePassed || !staticImportPassed) {
		process.exit(1);
	}
}
