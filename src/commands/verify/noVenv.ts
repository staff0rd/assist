import { execSync } from "node:child_process";

export function noVenv(): void {
	try {
		const output = execSync(
			"find . -type d -name venv -not -path '*/node_modules/*'",
			{
				encoding: "utf-8",
			},
		).trim();

		if (output.length === 0) {
			console.log("No venv folders found.");
			process.exit(0);
		}

		const folders = output.split("\n");

		console.log("venv folders found:\n");

		for (const folder of folders) {
			console.log(`  ${folder}`);
		}

		console.log(`\nTotal: ${folders.length} venv folder(s)`);
		console.log(
			"\nRemove venv folders and use a project-level virtual environment manager instead.",
		);
		console.log("Add 'venv/' to .gitignore if needed.");
		process.exit(1);
	} catch {
		console.log("No venv folders found.");
		process.exit(0);
	}
}
