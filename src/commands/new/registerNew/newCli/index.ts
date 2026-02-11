import { execSync } from "node:child_process";
import { basename, resolve } from "node:path";
import { init } from "../../../init";
import { run as verifyRun } from "../../../verify";
import { initPackageJson } from "./initPackageJson";
import { writeCliTemplate } from "./writeCliTemplate";

export async function newCli(): Promise<void> {
	const name = basename(resolve("."));

	initPackageJson(name);

	console.log("Installing dependencies...");
	execSync("npm install commander", { stdio: "inherit" });
	execSync("npm install -D tsup typescript @types/node", {
		stdio: "inherit",
	});

	writeCliTemplate(name);

	await init();
	await verifyRun();
}
