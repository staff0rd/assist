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
			resets_at?: number;
		};
		seven_day?: {
			used_percentage?: number;
			resets_at?: number;
		};
	};
};

function formatNumber(num: number): string {
	return num.toLocaleString("en-US");
}

function formatTimeLeft(resetsAt: number): string {
	const seconds = Math.max(0, resetsAt - Math.floor(Date.now() / 1000));
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

function colorizePercent(pct: number): string {
	const label = `${Math.round(pct)}%`;
	if (pct > 80) return chalk.red(label);
	if (pct > 40) return chalk.yellow(label);
	return label;
}

type RateLimit = { used_percentage: number; resets_at?: number };

function formatLimit(limit: RateLimit, fallbackLabel: string): string {
	const label = limit.resets_at
		? formatTimeLeft(limit.resets_at)
		: fallbackLabel;
	return `${colorizePercent(limit.used_percentage)} (${label})`;
}

function buildLimitsSegment(rateLimits?: StatusInput["rate_limits"]): string {
	const fiveHrPct = rateLimits?.five_hour?.used_percentage;
	const sevenDayPct = rateLimits?.seven_day?.used_percentage;
	if (fiveHrPct == null || sevenDayPct == null) return "";
	const fiveHr = {
		used_percentage: fiveHrPct,
		resets_at: rateLimits?.five_hour?.resets_at,
	};
	const sevenDay = {
		used_percentage: sevenDayPct,
		resets_at: rateLimits?.seven_day?.resets_at,
	};
	return ` | Limits - ${formatLimit(fiveHr, "5h")}, ${formatLimit(sevenDay, "7d")}`;
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
}
