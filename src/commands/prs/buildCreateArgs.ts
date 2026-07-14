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

export function buildEditArgs(number: number, title: string, body: string) {
	return ["pr", "edit", String(number), "--title", title, "--body", body];
}

export function buildCreateArgs(
	title: string,
	body: string,
	options: CreateOptions,
) {
	const args = ["pr", "create", "--title", title, "--body", body];

	const valueFlags = [
		["--base", options.base],
		["--head", options.head],
		["--milestone", options.milestone],
	] as const;
	for (const [flag, value] of valueFlags) {
		if (value) args.push(flag, value);
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
			args.push(flag, value);
		}
	}

	return args;
}
