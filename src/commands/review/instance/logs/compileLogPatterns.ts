export function compileLogPatterns(patterns: string[], key: string): RegExp[] {
	return patterns.map((pattern) => {
		try {
			return new RegExp(pattern, "i");
		} catch (error) {
			throw new Error(
				`${key} has an invalid pattern "${pattern}": ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	});
}
