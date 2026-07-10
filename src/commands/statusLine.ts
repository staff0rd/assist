import chalk from "chalk";
import { readStdin } from "../lib/readStdin";
import type { RateLimits } from "../shared/RateLimits";
import { windowsCwdToWslPath } from "./sessions/web/windowsCwdToWslPath";
import { buildLimitsSegment } from "./buildLimitsSegment";
import { readGitBranch } from "./readGitBranch";
import { relayRateLimits } from "./relayRateLimits";
import { relayUsage } from "./relayUsage";

// stdout is piped so chalk disables colour; force it on
chalk.level = 3;

type StatusInput = {
	session_id?: string;
	model: {
		display_name: string;
	};
	context_window: {
		total_input_tokens: number;
		total_output_tokens: number;
		used_percentage?: number;
	};
	rate_limits?: RateLimits;
	workspace?: {
		current_dir?: string;
	};
	cwd?: string;
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

	const dir = data.workspace?.current_dir ?? data.cwd;
	const branch = dir ? readGitBranch(windowsCwdToWslPath(dir)) : null;
	// 🌿️ needs trailing U+FE0F for stable width
	const branchSegment = branch ? `🌿️ ${chalk.cyan(branch)} | ` : "";

	console.log(
		`${branchSegment}${model} | Tokens - ${formatNumber(totalIn)} ↑ : ${formatNumber(totalOut)} ↓ | Context - ${colorizePercent(usedPct)}${buildLimitsSegment(data.rate_limits)}`,
	);

	await relayRateLimits(data.rate_limits);
	await relayUsage(
		data.session_id,
		totalIn,
		totalOut,
		data.context_window.used_percentage,
	);
}
