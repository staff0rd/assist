import { type MaintainabilityOptions, withSourceFiles } from "../shared";
import { displayMaintainabilityResults } from "./displayMaintainabilityResults";
import { printMaintainabilityFormula } from "./printMaintainabilityFormula";
import { collectFileMetrics } from "./collectFileMetrics";
import { aggregateResults } from "./aggregateResults";

export async function maintainability(
	pattern = "**/*.ts",
	options: MaintainabilityOptions = {},
): Promise<void> {
	printMaintainabilityFormula();
	withSourceFiles(
		pattern,
		(files) => {
			const fileMetrics = collectFileMetrics(files);
			const results = aggregateResults(fileMetrics);
			displayMaintainabilityResults(results, options.threshold);
		},
		options.ignore ?? [],
	);
}
