import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

export function initPackageJson(name: string): void {
	console.log("Initializing package.json...");
	execSync("npm init -y", { stdio: "inherit" });

	console.log("Configuring package.json...");
	const { main: _main, ...pkg } = JSON.parse(
		readFileSync("package.json", "utf8"),
	);
	const configured = {
		...pkg,
		type: "module",
		bin: { ...pkg.bin, [name]: "./dist/index.js" },
		scripts: {
			...pkg.scripts,
			build: "tsup",
			start: "node dist/index.js",
		},
	};
	writeFileSync("package.json", `${JSON.stringify(configured, null, 2)}\n`);
}
