import { execSync } from "node:child_process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getInstallDir(): string {
	// Go up from dist/ to the package root (tsup bundles into dist/index.js)
	return path.resolve(__dirname, "..");
}

function isGitRepo(dir: string): boolean {
	try {
		execSync("git rev-parse --is-inside-work-tree", {
			cwd: dir,
			stdio: "pipe",
		});
		return true;
	} catch {
		return false;
	}
}

function isGlobalNpmInstall(dir: string): boolean {
	try {
		const globalPrefix = execSync("npm prefix -g", { stdio: "pipe" })
			.toString()
			.trim();
		return path
			.resolve(dir)
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
