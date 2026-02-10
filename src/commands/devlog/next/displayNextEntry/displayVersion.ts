import chalk from "chalk";
import { getVersionAtCommit, stripToMinor } from "../../getLastVersionInfo";

export function displayVersion(
	conventional: boolean,
	firstHash: string | undefined,
	patchVersion: string | null,
	minorVersion: string | null,
): void {
	if (conventional && firstHash) {
		const version = getVersionAtCommit(firstHash);
		if (version) {
			console.log(`${chalk.bold("version:")} ${stripToMinor(version)}`);
		} else {
			console.log(`${chalk.bold("version:")} ${chalk.red("unknown")}`);
		}
	} else if (patchVersion && minorVersion) {
		console.log(
			`${chalk.bold("version:")} ${patchVersion} (patch) or ${minorVersion} (minor)`,
		);
	} else {
		console.log(`${chalk.bold("version:")} v0.1 (initial)`);
	}
}
