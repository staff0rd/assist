import chalk from "chalk";

type UpdateOptions = {
	name?: string;
	desc?: string;
	type?: string;
	ac?: string[];
};

export function buildUpdateSql(options: UpdateOptions) {
	const { name, desc, type, ac } = options;

	if (!name && !desc && !type && !ac) {
		console.log(chalk.red("Nothing to update. Provide at least one flag."));
		process.exitCode = 1;
		return undefined;
	}

	if (type && type !== "story" && type !== "bug") {
		console.log(chalk.red('Invalid type. Must be "story" or "bug".'));
		process.exitCode = 1;
		return undefined;
	}

	const sets: string[] = [];
	const params: unknown[] = [];
	const fieldNames: string[] = [];

	if (name) {
		sets.push("name = ?");
		params.push(name);
		fieldNames.push("name");
	}
	if (desc) {
		sets.push("description = ?");
		params.push(desc);
		fieldNames.push("description");
	}
	if (type) {
		sets.push("type = ?");
		params.push(type);
		fieldNames.push("type");
	}
	if (ac) {
		sets.push("acceptance_criteria = ?");
		params.push(JSON.stringify(ac));
		fieldNames.push("acceptance criteria");
	}

	return { sets, params, fields: fieldNames.join(", ") };
}
