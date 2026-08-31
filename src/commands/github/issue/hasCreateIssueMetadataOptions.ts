export type CreateIssueMetadataOptions = {
	repo?: string;
	type?: string;
	parent?: string;
	project?: string;
	status?: string;
	label?: string[];
};

export function hasCreateIssueMetadataOptions(
	options: CreateIssueMetadataOptions,
): boolean {
	if (options.status && !options.project) {
		throw new Error(
			"--status is a field on a project board, so it needs --project <number>",
		);
	}
	return Boolean(
		options.type || options.parent || options.project || options.label?.length,
	);
}
