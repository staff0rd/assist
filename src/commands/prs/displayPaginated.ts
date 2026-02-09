import chalk from "chalk";
import enquirer from "enquirer";
import type { PullRequest } from "./types";

const PAGE_SIZE = 10;

function getStatus(pr: PullRequest): { label: string; date: string } {
	if (pr.state === "MERGED" && pr.mergedAt) {
		return { label: chalk.magenta("merged"), date: pr.mergedAt };
	}
	if (pr.state === "CLOSED" && pr.closedAt) {
		return { label: chalk.red("closed"), date: pr.closedAt };
	}
	return { label: chalk.green("opened"), date: pr.createdAt };
}

function displayPage(
	pullRequests: PullRequest[],
	totalPages: number,
	page: number,
): void {
	const start = page * PAGE_SIZE;
	const end = Math.min(start + PAGE_SIZE, pullRequests.length);
	const pagePrs = pullRequests.slice(start, end);

	console.log(
		`\nPage ${page + 1} of ${totalPages} (${pullRequests.length} total)\n`,
	);

	for (const pr of pagePrs) {
		const status = getStatus(pr);
		const formattedDate = new Date(status.date).toISOString().split("T")[0];
		const fileCount = pr.changedFiles.toLocaleString();

		console.log(
			`${chalk.cyan(`#${pr.number}`)} ${pr.title} ${chalk.dim(`(${pr.author.login},`)} ${status.label} ${chalk.dim(`${formattedDate})`)}`,
		);
		console.log(chalk.dim(`  ${fileCount} files | ${pr.url}`));
		console.log();
	}
}

export async function displayPaginated(
	pullRequests: PullRequest[],
): Promise<void> {
	const totalPages = Math.ceil(pullRequests.length / PAGE_SIZE);
	let currentPage = 0;

	displayPage(pullRequests, totalPages, currentPage);

	if (totalPages <= 1) {
		return;
	}

	while (true) {
		const hasNext = currentPage < totalPages - 1;
		const hasPrev = currentPage > 0;

		const choices: { name: string; value: string }[] = [];
		if (hasNext) choices.push({ name: "Next page", value: "next" });
		if (hasPrev) choices.push({ name: "Previous page", value: "prev" });
		choices.push({ name: "Quit", value: "quit" });

		const { action } = await enquirer.prompt<{ action: string }>({
			type: "select",
			name: "action",
			message: "Navigate",
			choices,
		});

		if (action === "Next page") {
			currentPage++;
			displayPage(pullRequests, totalPages, currentPage);
		} else if (action === "Previous page") {
			currentPage--;
			displayPage(pullRequests, totalPages, currentPage);
		} else {
			break;
		}
	}
}
