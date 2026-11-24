export type EditIssueOptions = {
	repo?: string;
	fresh?: boolean;
	fetch?: boolean;
	body?: string;
	title?: string;
	parent?: string;
	screenshot?: string[];
};

const USAGE =
	"Usage: assist github issue edit <number> [-R <owner>/<repo>] [--body <body>] [--title <title>] [--fetch] [--parent <issue>] [--screenshot '[Group/]Caption=path']";

export function parseEditIssueArgs(
	numberArg: string,
	options: EditIssueOptions,
): number {
	const number = Number.parseInt(numberArg, 10);
	const badTitle = options.title !== undefined && !options.title.trim();
	const badFetch =
		options.fetch && (options.title !== undefined || options.parent);
	if (!Number.isInteger(number) || number <= 0 || badTitle || badFetch) {
		console.error(USAGE);
		process.exit(1);
	}
	return number;
}
