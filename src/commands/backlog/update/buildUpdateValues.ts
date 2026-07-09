import chalk from "chalk";
import type { items } from "../../../shared/db/schema";

type UpdateOptions = {
	name?: string;
	desc?: string;
	type?: string;
	ac?: string[];
};

/** The subset of item columns an update touches, as a Drizzle `.set()` payload. */
type ItemUpdate = Partial<typeof items.$inferInsert>;

/**
 * Validate the requested item edits and build a Drizzle `.set()` payload plus a
 * human-readable list of the fields changed. Returns `undefined` (after logging)
 * when there is nothing to update or the type is invalid.
 */
export function buildUpdateValues(options: UpdateOptions) {
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

	const set: ItemUpdate = {};
	const fieldNames: string[] = [];

	if (name) {
		set.name = name;
		fieldNames.push("name");
	}
	if (desc) {
		set.description = desc.replaceAll(String.raw`\n`, "\n");
		fieldNames.push("description");
	}
	if (type) {
		set.type = type;
		fieldNames.push("type");
	}
	if (ac) {
		set.acceptanceCriteria = JSON.stringify(ac);
		fieldNames.push("acceptance criteria");
	}

	return { set, fields: fieldNames.join(", ") };
}
