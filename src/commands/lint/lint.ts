// Implements conventions not enforced by biomejs
import { runFileNameCheck } from "./runFileNameCheck";
import { runImportExtensionCheck } from "./runImportExtensionCheck";
import { runStaticImportCheck } from "./runStaticImportCheck";

export function lint(): void {
	const fileNamePassed = runFileNameCheck();
	const staticImportPassed = runStaticImportCheck();
	const importExtensionPassed = runImportExtensionCheck();

	if (!fileNamePassed || !staticImportPassed || !importExtensionPassed) {
		process.exit(1);
	}
}
