import * as readline from "node:readline";

export async function readStdinLines(): Promise<string[]> {
	const rl = readline.createInterface({
		input: process.stdin,
		terminal: false,
	});

	const lines: string[] = [];
	for await (const line of rl) {
		lines.push(line);
	}

	return lines;
}
