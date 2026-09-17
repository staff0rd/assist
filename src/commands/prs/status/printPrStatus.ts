import chalk from "chalk";
import type { PrStatus } from "./types";

function flags(pr: PrStatus): string {
	const markers = [];
	if (pr.isDraft) markers.push("draft");
	if (pr.isBot) markers.push("bot");
	return markers.length ? ` ${chalk.yellow(`[${markers.join(", ")}]`)}` : "";
}

function updated(pr: PrStatus): string {
	return pr.ageHours === null ? "updated unknown" : `updated ${pr.age} ago`;
}

function reviewLine(pr: PrStatus): string | null {
	if (!pr.reviewDecision && pr.reviews.length === 0) return null;
	const reviewers = pr.reviews
		.map((review) => `${review.reviewer}: ${review.state}`)
		.join(", ");
	const decision = pr.reviewDecision ?? "no decision";
	return reviewers
		? `review: ${decision} | ${reviewers}`
		: `review: ${decision}`;
}

function checkLines(pr: PrStatus): string[] {
	const lines = [];
	if (pr.checks.failing.length) {
		lines.push(chalk.red(`failing: ${pr.checks.failing.join(", ")}`));
	}
	if (pr.checks.pending.length) {
		lines.push(chalk.yellow(`pending: ${pr.checks.pending.join(", ")}`));
	}
	return lines;
}

function mergeableLine(pr: PrStatus): string | null {
	if (pr.mergeable === "CONFLICTING") return chalk.red("conflicting");
	if (pr.mergeable === "MERGEABLE") return null;
	return chalk.dim(`mergeable: ${pr.mergeable.toLowerCase()}`);
}

export function printPrStatus(pr: PrStatus): void {
	console.log(
		`  ${chalk.cyan(`#${pr.number}`)} ${pr.title} ${chalk.dim(`(${pr.author}, ${updated(pr)})`)}${flags(pr)}`,
	);
	const details = [
		reviewLine(pr),
		...checkLines(pr),
		mergeableLine(pr),
		chalk.dim(pr.url),
	];
	for (const detail of details) {
		if (detail) console.log(`      ${detail}`);
	}
}
