import { spawnSync } from "node:child_process";

export function coverage(): void {
	const result = spawnSync(
		"npx",
		[
			"vitest",
			"run",
			"--coverage",
			"--coverage.include=src/**/*.ts",
			"--coverage.all",
			"--coverage.reporter=text",
		],
		{
			encoding: "utf8",
			timeout: 120_000,
			shell: process.platform === "win32",
		},
	);
	const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

	const match = output.match(/All files\s*\|\s*([\d.]+)/);
	if (!match) {
		console.error("Could not determine coverage from vitest output.");
		process.exit(1);
	}

	console.log(`${match[1]}%`);
}
