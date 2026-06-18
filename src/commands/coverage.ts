import { execSync } from "node:child_process";

export function coverage(): void {
	const output = execSync(
		"npx vitest run --coverage --coverage.include='src/**/*.ts' --coverage.all --coverage.reporter=text 2>&1",
		{ encoding: "utf8", timeout: 120_000 },
	);

	const match = output.match(/All files\s*\|\s*([\d.]+)/);
	if (!match) {
		console.error("Could not determine coverage from vitest output.");
		process.exit(1);
	}

	console.log(`${match[1]}%`);
}
