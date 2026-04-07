import { execSync } from "node:child_process";

type DayCount = { date: string; count: number };

function fetchContributions(from: string, to: string): DayCount[] {
	const query = `{ viewer { contributionsCollection(from: "${from}T00:00:00Z", to: "${to}T23:59:59Z") { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`;
	const jq =
		".data.viewer.contributionsCollection.contributionCalendar.weeks[].contributionDays[]";

	const raw = execSync(`gh api graphql -f query='${query}' --jq '${jq}'`, {
		encoding: "utf-8",
	}).trim();

	if (!raw) return [];

	return raw.split("\n").map((line) => {
		const obj = JSON.parse(line) as { date: string; contributionCount: number };
		return { date: obj.date, count: obj.contributionCount };
	});
}

export function fetchCommitsPerDay(since: string): DayCount[] {
	const start = new Date(since);
	const end = new Date();
	const results: DayCount[] = [];

	let cursor = new Date(start);
	while (cursor <= end) {
		const yearEnd = new Date(cursor);
		yearEnd.setFullYear(yearEnd.getFullYear(), yearEnd.getMonth() + 12);
		yearEnd.setDate(yearEnd.getDate() - 1);
		const windowEnd = yearEnd > end ? end : yearEnd;

		const from = cursor.toISOString().slice(0, 10);
		const to = windowEnd.toISOString().slice(0, 10);

		results.push(...fetchContributions(from, to));
		cursor = new Date(windowEnd);
		cursor.setDate(cursor.getDate() + 1);
	}

	return results.filter(
		(d) => d.date >= since && d.date <= end.toISOString().slice(0, 10),
	);
}
