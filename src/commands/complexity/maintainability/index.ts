import { type MaintainabilityOptions, withSourceFiles } from "../shared";
import { aggregateResults } from "./aggregateResults";
import { collectFileMetrics } from "./collectFileMetrics";
import { displayMaintainabilityResults } from "./displayMaintainabilityResults";

export async function maintainability(
	pattern = "**/*.ts",
	options: MaintainabilityOptions = {},
): Promise<void> {
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
