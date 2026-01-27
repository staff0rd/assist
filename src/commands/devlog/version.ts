import chalk from "chalk";
import { bumpVersion, getLastVersionInfo } from "./getLastVersionInfo";
import { getRepoName, loadConfig } from "./shared";

export function version(): void {
	const config = loadConfig();
	const name = getRepoName();
	const lastInfo = getLastVersionInfo(name, config);
	const lastVersion = lastInfo?.version ?? null;
	const nextVersion = lastVersion ? bumpVersion(lastVersion, "patch") : null;

	console.log(`${chalk.bold("name:")} ${name}`);
	console.log(`${chalk.bold("last:")} ${lastVersion ?? chalk.dim("none")}`);
	console.log(`${chalk.bold("next:")} ${nextVersion ?? chalk.dim("none")}`);
}
