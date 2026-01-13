import { execSync } from "node:child_process";
import chalk from "chalk";
import enquirer from "enquirer";

type PullRequest = {
	number: number;
	title: string;
	url: string;
	author: { login: string };
	createdAt: string;
	mergedAt: string | null;
	closedAt: string | null;
	state: "OPEN" | "CLOSED" | "MERGED";
	changedFiles: number;
};

type PrsOptions = {
	open?: boolean;
	closed?: boolean;
};

const PAGE_SIZE = 10;

export async function prs(options: PrsOptions): Promise<void> {
	const state = options.open ? "open" : options.closed ? "closed" : "all";

	try {
		const result = execSync(
			`gh pr list --state ${state} --json number,title,url,author,createdAt,mergedAt,closedAt,state,changedFiles --limit 100`,
			{ encoding: "utf-8" },
		);

		const pullRequests: PullRequest[] = JSON.parse(result);

		if (pullRequests.length === 0) {
			console.log(
				`No ${state === "all" ? "" : `${state} `}pull requests found.`,
			);
			return;
		}

		await displayPaginated(pullRequests);
	} catch (error) {
		if (error instanceof Error) {
			const msg = error.message.toLowerCase();
			if (msg.includes("enoent") || msg.includes("command not found")) {
				console.error("Error: GitHub CLI (gh) is not installed.");
				console.error("Install it from https://cli.github.com/");
				return;
			}
		}
		throw error;
	}
}

async function displayPaginated(pullRequests: PullRequest[]): Promise<void> {
	const totalPages = Math.ceil(pullRequests.length / PAGE_SIZE);
	let currentPage = 0;

	const getStatus = (pr: PullRequest): { label: string; date: string } => {
		if (pr.state === "MERGED" && pr.mergedAt) {
			return { label: chalk.magenta("merged"), date: pr.mergedAt };
		}
		if (pr.state === "CLOSED" && pr.closedAt) {
			return { label: chalk.red("closed"), date: pr.closedAt };
		}
		return { label: chalk.green("opened"), date: pr.createdAt };
	};

	const displayPage = (page: number): void => {
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
	};

	displayPage(currentPage);

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
			displayPage(currentPage);
		} else if (action === "Previous page") {
			currentPage--;
			displayPage(currentPage);
		} else {
			break;
		}
	}
}
