const timestampPattern = /@Timestamp/i;

export function rejectTimestampFilter(filter: string): void {
	if (timestampPattern.test(filter)) {
		throw new Error(
			"Timestamp expressions are not supported in the filter string. Use --from and --to options instead.",
		);
	}
}
