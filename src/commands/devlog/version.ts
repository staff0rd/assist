import chalk from "chalk";
import { loadDevEntry } from "./loadDevEntry";
import { loadDevWeeks } from "./loadDevWeeks";
import { resolveDevDir } from "./resolveDevDir";
import { resolveVersionSource } from "./resolveVersionSource";
import { getRepoName } from "./shared";

function printField(label: string, value: string | null | undefined): void {
	console.log(`${chalk.bold(`${label}:`)} ${value ?? chalk.dim("none")}`);
}

export function version(): void {
	const devDir = resolveDevDir();
	const name = getRepoName();
	const lastWeek = loadDevWeeks(name, devDir).at(-1) ?? null;
	const entry = lastWeek ? loadDevEntry(name, lastWeek, devDir) : null;

	printField("name", name);
	printField("last week", lastWeek);
	printField("last version", entry?.lastVersion);
	printField("current", resolveVersionSource().current());
}
