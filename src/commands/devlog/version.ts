import chalk from "chalk";
import { loadDevEntry } from "./loadDevEntry";
import { loadDevWeeks } from "./loadDevWeeks";
import { resolveDevDir } from "./resolveDevDir";
import { resolveVersionSource } from "./resolveVersionSource";
import { getRepoName } from "./shared";
import { stripToMinor } from "./stripToMinor";

function printField(label: string, value: string | null | undefined): void {
	console.log(`${chalk.bold(`${label}:`)} ${value ?? chalk.dim("none")}`);
}

function currentVersion(): string | null {
	const source = resolveVersionSource();
	const version = source.versionAt("HEAD");
	if (!version) return null;
	return source.kind === "tags" ? version : stripToMinor(version);
}

export function version(): void {
	const devDir = resolveDevDir();
	const name = getRepoName();
	const lastWeek = loadDevWeeks(name, devDir).at(-1) ?? null;
	const entry = lastWeek ? loadDevEntry(name, lastWeek, devDir) : null;

	printField("name", name);
	printField("last week", lastWeek);
	printField("last version", entry?.lastVersion);
	printField("current", currentVersion());
}
