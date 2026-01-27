import * as readline from "node:readline";

export async function readStdin(): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	let inputData = "";

	for await (const line of rl) {
		inputData += line;
	}

	return inputData;
}
