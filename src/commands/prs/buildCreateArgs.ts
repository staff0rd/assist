import { shellQuote } from "../../shared/shellQuote";

export type CreateOptions = {
	title?: string;
	body?: string;
	base?: string;
	head?: string;
	draft?: boolean;
	web?: boolean;
	label?: string[];
	assignee?: string[];
	reviewer?: string[];
	milestone?: string;
};

export function buildCreateArgs(
	title: string,
	body: string,
	options: CreateOptions,
) {
	const args = [
		"gh pr create",
		`--title ${shellQuote(title)}`,
		`--body ${shellQuote(body)}`,
	];

	const valueFlags = [
		["--base", options.base],
		["--head", options.head],
		["--milestone", options.milestone],
	] as const;
	for (const [flag, value] of valueFlags) {
		if (value) args.push(`${flag} ${shellQuote(value)}`);
	}

	if (options.draft) args.push("--draft");
	if (options.web) args.push("--web");

	const repeatableFlags = [
		["--label", options.label],
		["--assignee", options.assignee],
		["--reviewer", options.reviewer],
	] as const;
	for (const [flag, values] of repeatableFlags) {
		for (const value of values ?? []) {
			args.push(`${flag} ${shellQuote(value)}`);
		}
	}

	return args;
}
