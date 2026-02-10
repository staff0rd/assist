import enquirer from "enquirer";
import type { PullRequest } from "../../types";
import { printPr } from "./printPr";

const PAGE_SIZE = 10;

function getPageSlice(
	pullRequests: PullRequest[],
	page: number,
): PullRequest[] {
	const start = page * PAGE_SIZE;
	return pullRequests.slice(start, start + PAGE_SIZE);
}

function pageHeader(page: number, totalPages: number, total: number): string {
	return `\nPage ${page + 1} of ${totalPages} (${total} total)\n`;
}

function displayPage(
	pullRequests: PullRequest[],
	totalPages: number,
	page: number,
): void {
	console.log(pageHeader(page, totalPages, pullRequests.length));
	for (const pr of getPageSlice(pullRequests, page)) printPr(pr);
}

function hasNextPage(page: number, total: number): boolean {
	return page < total - 1;
}

const NEXT_CHOICE = { name: "Next page", value: "next" };
const PREV_CHOICE = { name: "Previous page", value: "prev" };

function getOptionalChoices(
	currentPage: number,
	totalPages: number,
): { name: string; value: string }[] {
	const choices: { name: string; value: string }[] = [];
	if (hasNextPage(currentPage, totalPages)) choices.push(NEXT_CHOICE);
	if (currentPage > 0) choices.push(PREV_CHOICE);
	return choices;
}

function buildNavChoices(
	currentPage: number,
	totalPages: number,
): { name: string; value: string }[] {
	return [
		...getOptionalChoices(currentPage, totalPages),
		{ name: "Quit", value: "quit" },
	];
}

function parseAction(action: string): number {
	if (action === "Next page") return 1;
	if (action === "Previous page") return -1;
	return 0;
}

async function promptNavigation(
	currentPage: number,
	totalPages: number,
): Promise<number> {
	const choices = buildNavChoices(currentPage, totalPages);
	const { action } = await enquirer.prompt<{ action: string }>({
		type: "select",
		name: "action",
		message: "Navigate",
		choices,
	});
	return parseAction(action);
}

function computeTotalPages(count: number): number {
	return Math.ceil(count / PAGE_SIZE);
}

async function navigateAndDisplay(
	pullRequests: PullRequest[],
	totalPages: number,
	currentPage: number,
): Promise<number | null> {
	const delta = await promptNavigation(currentPage, totalPages);
	if (delta === 0) return null;
	const next = currentPage + delta;
	displayPage(pullRequests, totalPages, next);
	return next;
}

async function paginationLoop(
	pullRequests: PullRequest[],
	totalPages: number,
): Promise<void> {
	let page: number | null = 0;
	displayPage(pullRequests, totalPages, page);
	while (totalPages > 1 && page !== null) {
		page = await navigateAndDisplay(pullRequests, totalPages, page);
	}
}

export async function displayPaginated(
	pullRequests: PullRequest[],
): Promise<void> {
	await paginationLoop(pullRequests, computeTotalPages(pullRequests.length));
}
