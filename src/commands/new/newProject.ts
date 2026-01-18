import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { removeEslint } from "../../shared/removeEslint";
import { init as deployInit } from "../deploy/init";
import { init } from "../init";

export async function newProject(): Promise<void> {
	console.log("Initializing Vite with react-ts template...");
	execSync("npm create vite@latest . -- --template react-ts", {
		stdio: "inherit",
	});

	removeEslint({ removeLintScripts: true });
	addViteBaseConfig();
	await init();
	await deployInit();
}

function addViteBaseConfig(): void {
	const viteConfigPath = "vite.config.ts";
	if (!existsSync(viteConfigPath)) {
		console.log("No vite.config.ts found, skipping base config");
		return;
	}

	const content = readFileSync(viteConfigPath, "utf-8");
	if (content.includes("base:")) {
		console.log("vite.config.ts already has base config");
		return;
	}

	const updated = content.replace(
		/defineConfig\(\{/,
		'defineConfig({\n\tbase: "./",',
	);

	if (updated !== content) {
		writeFileSync(viteConfigPath, updated);
		console.log('Added base: "./" to vite.config.ts');
	}
}
