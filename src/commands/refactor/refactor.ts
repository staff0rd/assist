import { runFileGrowthCheck } from "./fileGrowthCheck";
import { runFileNameCheck } from "./fileNameCheck";

export function refactor(): void {
	const fileGrowthPassed = runFileGrowthCheck();
	const fileNamePassed = runFileNameCheck();

	if (!fileGrowthPassed || !fileNamePassed) {
		process.exit(1);
	}
}
