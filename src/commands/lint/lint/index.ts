// Implements conventions not enforced by biomejs
import { runFileNameCheck } from "./runFileNameCheck";
import { runImportExtensionCheck } from "./runImportExtensionCheck";
import { runStaticImportCheck } from "./runStaticImportCheck";

type LintOptions = {
	fix?: boolean;
};

export function lint(options: LintOptions = {}): void {
	const fileNamePassed = runFileNameCheck(options.fix);
	const staticImportPassed = runStaticImportCheck();
	const importExtensionPassed = runImportExtensionCheck();

	if (!fileNamePassed || !staticImportPassed || !importExtensionPassed) {
		process.exit(1);
	}
}
