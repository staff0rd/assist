import { runFileGrowthCheck } from "./fileGrowthCheck";
import { runFileNameCheck } from "./fileNameCheck";
import { runInterfaceCheck } from "./interfaceCheck";

export function refactor(): void {
	const interfacePassed = runInterfaceCheck();
	const fileGrowthPassed = runFileGrowthCheck();
	const fileNamePassed = runFileNameCheck();

	if (!interfacePassed || !fileGrowthPassed || !fileNamePassed) {
		process.exit(1);
	}
}
