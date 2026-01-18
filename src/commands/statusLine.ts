import * as readline from "node:readline";

type StatusInput = {
	model: {
		display_name: string;
	};
	context_window: {
		total_input_tokens: number;
		total_output_tokens: number;
		used_percentage?: number;
	};
};

function formatNumber(num: number): string {
	return num.toLocaleString("en-US");
}

export async function statusLine(): Promise<void> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false,
	});

	let inputData = "";

	for await (const line of rl) {
		inputData += line;
	}

	const data: StatusInput = JSON.parse(inputData);

	const model = data.model.display_name;
	const totalInput = data.context_window.total_input_tokens;
	const totalOutput = data.context_window.total_output_tokens;
	const usedPct = data.context_window.used_percentage ?? 0;

	const formattedInput = formatNumber(totalInput);
	const formattedOutput = formatNumber(totalOutput);

	console.log(
		`Model - ${model} | Tokens - ${formattedOutput} ↑ : ${formattedInput} ↓ | Context - ${usedPct}%`,
	);
}
