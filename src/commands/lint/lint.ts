import { runFileNameCheck } from "./lint/runFileNameCheck";
import { runImportExtensionCheck } from "./lint/runImportExtensionCheck";
import { runStaticImportCheck } from "./lint/runStaticImportCheck";

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
