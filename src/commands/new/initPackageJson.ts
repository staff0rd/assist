import { execSync } from "node:child_process";

export function initPackageJson(name: string): void {
	console.log("Initializing package.json...");
	execSync("npm init -y", { stdio: "inherit" });

	console.log("Configuring package.json...");
	execSync("npm pkg delete main", { stdio: "inherit" });
	execSync("npm pkg set type=module", { stdio: "inherit" });
	execSync(`npm pkg set bin.${name}=./dist/index.js`, { stdio: "inherit" });
	execSync("npm pkg set scripts.build=tsup", { stdio: "inherit" });
	execSync('npm pkg set scripts.start="node dist/index.js"', {
		stdio: "inherit",
	});
}
