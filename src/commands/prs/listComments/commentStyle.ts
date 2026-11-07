import chalk from "chalk";
import { isAgentHarness } from "../../../lib/isAgentHarness";

export type Style = {
	cyan: (text: string) => string;
	bold: (text: string) => string;
	dim: (text: string) => string;
	state: (state: string) => string;
	diffHunk: boolean;
	agent: boolean;
};

const plain = (text: string) => text;

function colouredState(state: string): string {
	const label = `[${state}]`;
	if (state === "APPROVED") return chalk.green(label);
	if (state === "CHANGES_REQUESTED") return chalk.red(label);
	return chalk.yellow(label);
}

export function commentStyle(): Style {
	if (isAgentHarness()) {
		return {
			cyan: plain,
			bold: plain,
			dim: plain,
			state: (state) => `[${state}]`,
			diffHunk: false,
			agent: true,
		};
	}
	return {
		cyan: chalk.cyan,
		bold: chalk.bold,
		dim: chalk.dim,
		state: colouredState,
		diffHunk: true,
		agent: false,
	};
}
