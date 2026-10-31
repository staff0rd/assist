import { runFileNameCheck } from "./lint/runFileNameCheck";
import { runImportExtensionCheck } from "./lint/runImportExtensionCheck";
import { runSilentCatchCheck } from "./lint/runSilentCatchCheck";
import { runStaticImportCheck } from "./lint/runStaticImportCheck";

type LintOptions = {
	fix?: boolean;
};

export function lint(options: LintOptions = {}): void {
	const fileNamePassed = runFileNameCheck(options.fix);
	const staticImportPassed = runStaticImportCheck();
	const importExtensionPassed = runImportExtensionCheck();
	const silentCatchPassed = runSilentCatchCheck();

	if (
		!fileNamePassed ||
		!staticImportPassed ||
		!importExtensionPassed ||
		!silentCatchPassed
	) {
		process.exit(1);
	}
}
