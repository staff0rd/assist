const URL_REGEX = /https?:\/\/\S/i;

export function validateCommitRefs(refs: string[]): void {
	for (const ref of refs) {
		if (!URL_REGEX.test(ref)) {
			console.error(
				`Error: --ref must contain an http or https URL (got: "${ref}")`,
			);
			process.exit(1);
		}
	}
}
