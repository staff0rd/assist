import chalk from "chalk";
import type { PullRequest } from "../../types";

const STATUS_MAP: Record<
	string,
	(pr: PullRequest) => { label: string; date: string } | null
> = {
	MERGED: (pr) =>
		pr.mergedAt ? { label: chalk.magenta("merged"), date: pr.mergedAt } : null,
	CLOSED: (pr) =>
		pr.closedAt ? { label: chalk.red("closed"), date: pr.closedAt } : null,
};

function defaultStatus(pr: PullRequest): { label: string; date: string } {
	return { label: chalk.green("opened"), date: pr.createdAt };
}

function getStatus(pr: PullRequest): { label: string; date: string } {
	return STATUS_MAP[pr.state]?.(pr) ?? defaultStatus(pr);
}

function formatDate(dateStr: string): string {
	return new Date(dateStr).toISOString().split("T")[0];
}

function formatPrHeader(
	pr: PullRequest,
	status: { label: string; date: string },
): string {
	return `${chalk.cyan(`#${pr.number}`)} ${pr.title} ${chalk.dim(`(${pr.author.login},`)} ${status.label} ${chalk.dim(`${formatDate(status.date)})`)}`;
}

function logPrDetails(pr: PullRequest): void {
	console.log(
		chalk.dim(`  ${pr.changedFiles.toLocaleString()} files | ${pr.url}`),
	);
	console.log();
}

export function printPr(pr: PullRequest): void {
	console.log(formatPrHeader(pr, getStatus(pr)));
	logPrDetails(pr);
}
