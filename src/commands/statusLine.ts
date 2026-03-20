import chalk from "chalk";
import { readStdin } from "../lib/readStdin";

type StatusInput = {
	model: {
		display_name: string;
	};
	context_window: {
		total_input_tokens: number;
		total_output_tokens: number;
		used_percentage?: number;
	};
	rate_limits?: {
		five_hour?: {
			used_percentage?: number;
		};
		seven_day?: {
			used_percentage?: number;
		};
	};
};

function formatNumber(num: number): string {
	return num.toLocaleString("en-US");
}

function colorizePercent(pct: number): string {
	const label = `${Math.round(pct)}%`;
	if (pct > 80) return chalk.red(label);
	if (pct > 40) return chalk.yellow(label);
	return label;
}

export async function statusLine(): Promise<void> {
	const inputData = await readStdin();
	const data: StatusInput = JSON.parse(inputData);

	const model = data.model.display_name;
	const totalInput = data.context_window.total_input_tokens;
	const totalOutput = data.context_window.total_output_tokens;
	const usedPct = data.context_window.used_percentage ?? 0;

	const formattedInput = formatNumber(totalInput);
	const formattedOutput = formatNumber(totalOutput);

	const fiveHrPct = data.rate_limits?.five_hour?.used_percentage;
	const sevenDayPct = data.rate_limits?.seven_day?.used_percentage;

	let limitsSegment = "";
	if (fiveHrPct != null && sevenDayPct != null) {
		limitsSegment = ` | Limits - ${colorizePercent(fiveHrPct)} (5h), ${colorizePercent(sevenDayPct)} (7d)`;
	}

	console.log(
		`${model} | Tokens - ${formattedOutput} ↑ : ${formattedInput} ↓ | Context - ${colorizePercent(usedPct)}${limitsSegment}`,
	);
}
