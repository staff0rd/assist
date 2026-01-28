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

type LineComment = {
	type: "line";
	id: number;
	user: string;
	path: string;
	line: number | null;
	body: string;
	diff_hunk: string;
};

type ReviewComment = {
	type: "review";
	id: number;
	user: string;
	state: string;
	body: string;
};

type PrComment = LineComment | ReviewComment;

type PrsOptions = {
	open?: boolean;
	closed?: boolean;
};

const PAGE_SIZE = 10;

function isGhNotInstalled(error: unknown): boolean {
	if (error instanceof Error) {
		const msg = error.message.toLowerCase();
		return msg.includes("enoent") || msg.includes("command not found");
	}
	return false;
}

function isNotFound(error: unknown): boolean {
	if (error instanceof Error) {
		return error.message.includes("HTTP 404");
	}
	return false;
}

function getRepoInfo(): { org: string; repo: string } {
	const repoInfo = JSON.parse(
		execSync("gh repo view --json owner,name", { encoding: "utf-8" }),
	);
	return { org: repoInfo.owner.login, repo: repoInfo.name };
}

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
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			return;
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

export async function comments(prNumber: number): Promise<PrComment[]> {
	try {
		const { org, repo } = getRepoInfo();
		const allComments: PrComment[] = [];

		// Fetch review-level comments
		const reviewResult = execSync(
			`gh api repos/${org}/${repo}/pulls/${prNumber}/reviews`,
			{ encoding: "utf-8" },
		);

		if (reviewResult.trim()) {
			const reviews = JSON.parse(reviewResult);
			for (const review of reviews) {
				if (review.body) {
					allComments.push({
						type: "review",
						id: review.id,
						user: review.user.login,
						state: review.state,
						body: review.body,
					});
				}
			}
		}

		// Fetch line-level comments
		const lineResult = execSync(
			`gh api repos/${org}/${repo}/pulls/${prNumber}/comments`,
			{ encoding: "utf-8" },
		);

		if (lineResult.trim()) {
			const lineComments = JSON.parse(lineResult);
			for (const comment of lineComments) {
				allComments.push({
					type: "line",
					id: comment.id,
					user: comment.user.login,
					path: comment.path,
					line: comment.line,
					body: comment.body,
					diff_hunk: comment.diff_hunk,
				});
			}
		}

		return allComments;
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			return [];
		}
		if (isNotFound(error)) {
			console.error("Error: Pull request not found.");
			return [];
		}
		throw error;
	}
}
