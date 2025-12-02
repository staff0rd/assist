// Implements conventions not enforced by biomejs
import { runFileNameCheck } from "./fileNameCheck";
import { runStaticImportCheck } from "./staticImportCheck";

export function lint(): void {
	const fileNamePassed = runFileNameCheck();
	const staticImportPassed = runStaticImportCheck();

	if (!fileNamePassed || !staticImportPassed) {
		process.exit(1);
	}
}
