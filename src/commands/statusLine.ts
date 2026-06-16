import chalk from "chalk";
import { readStdin } from "../lib/readStdin";
import type { RateLimits } from "../shared/RateLimits";
import { buildLimitsSegment } from "./buildLimitsSegment";
import { relayRateLimits } from "./relayRateLimits";

// stdout is piped so chalk disables colour; force it on
chalk.level = 3;

type StatusInput = {
	model: {
		display_name: string;
	};
	context_window: {
		total_input_tokens: number;
		total_output_tokens: number;
		used_percentage?: number;
	};
	rate_limits?: RateLimits;
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
	const { total_input_tokens: totalIn, total_output_tokens: totalOut } =
		data.context_window;
	const usedPct = data.context_window.used_percentage ?? 0;

	console.log(
		`${model} | Tokens - ${formatNumber(totalOut)} ↑ : ${formatNumber(totalIn)} ↓ | Context - ${colorizePercent(usedPct)}${buildLimitsSegment(data.rate_limits)}`,
	);

	await relayRateLimits(data.rate_limits);
}
