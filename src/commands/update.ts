import { execSync } from "node:child_process";
import * as path from "node:path";
import { getInstallDir, isGitRepo } from "../shared/getInstallDir";

function isGlobalNpmInstall(dir: string): boolean {
	try {
		const resolved = path.resolve(dir);
		// Check if installed inside a node_modules directory (covers fnm, nvm, etc.)
		if (resolved.split(path.sep).includes("node_modules")) {
			return true;
		}
		const globalPrefix = execSync("npm prefix -g", { stdio: "pipe" })
			.toString()
			.trim();
		return resolved
			.toLowerCase()
			.startsWith(path.resolve(globalPrefix).toLowerCase());
	} catch {
		return false;
	}
}

export async function update(): Promise<void> {
	const installDir = getInstallDir();
	console.log(`Assist is installed at: ${installDir}`);

	if (isGitRepo(installDir)) {
		console.log("Detected git repo installation, pulling latest...");
		execSync("git pull", { cwd: installDir, stdio: "inherit" });

		console.log("Installing dependencies...");
		execSync("npm i", { cwd: installDir, stdio: "inherit" });

		console.log("Building...");
		execSync("npm run build", { cwd: installDir, stdio: "inherit" });

		console.log("Syncing commands...");
		execSync("assist sync", { stdio: "inherit" });
	} else if (isGlobalNpmInstall(installDir)) {
		console.log("Detected global npm installation, updating...");
		execSync("npm i -g @staff0rd/assist@latest", { stdio: "inherit" });

		console.log("Syncing commands...");
		execSync("assist sync", { stdio: "inherit" });
	} else {
		console.error(
			"Could not determine installation method. Expected a git repo or global npm install.",
		);
		process.exit(1);
	}
}
