import chalk from "chalk";
import { getVersionAtCommit } from "./getVersionAtCommit";
import { loadDevEntry } from "./loadDevEntry";
import { loadDevWeeks } from "./loadDevWeeks";
import { getRepoName } from "./shared";
import { stripToMinor } from "./stripToMinor";

function printField(label: string, value: string | null | undefined): void {
	console.log(`${chalk.bold(`${label}:`)} ${value ?? chalk.dim("none")}`);
}

export function version(): void {
	const name = getRepoName();
	const lastWeek = loadDevWeeks(name).at(-1) ?? null;
	const entry = lastWeek ? loadDevEntry(name, lastWeek) : null;
	const current = getVersionAtCommit("HEAD");

	printField("name", name);
	printField("last week", lastWeek);
	printField("last version", entry?.lastVersion);
	printField("current", current ? stripToMinor(current) : null);
}
