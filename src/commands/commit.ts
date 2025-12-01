import { execSync } from "node:child_process";

export function commit(message: string): void {
	if (message.toLowerCase().includes("claude")) {
		console.error("Error: Commit message must not reference Claude");
		process.exit(1);
	}

	if (message.length > 40) {
		console.error(
			`Error: Commit message must be 40 characters or less (current: ${message.length})`,
		);
		process.exit(1);
	}

	try {
		execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
			stdio: "inherit",
		});
		process.exit(0);
	} catch (_error) {
		process.exit(1);
	}
}
