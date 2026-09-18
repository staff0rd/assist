import { readFileSync } from "node:fs";

export function readSlackParts(files: string[]): string[] {
	return files.map((file) => {
		let contents: string;
		try {
			contents = readFileSync(file, "utf8");
		} catch {
			console.error(`Error: Part file not found: ${file}`);
			process.exit(1);
		}
		const body = contents.trim();
		if (body.length === 0) {
			console.error(`Error: Part file is empty: ${file}`);
			process.exit(1);
		}
		return body;
	});
}
