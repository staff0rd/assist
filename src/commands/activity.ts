import { activityChart } from "./activity/activityChart";
import { fetchCommitsPerDay } from "./activity/fetchCommitsPerDay";

export async function activity(options: { since?: string }): Promise<void> {
	const since =
		options.since ??
		new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

	const data = fetchCommitsPerDay(since);

	if (data.length < 2) {
		console.log("Not enough data points to chart.");
		return;
	}

	const total = data.reduce((sum, d) => sum + d.count, 0);
	const activeDays = data.filter((d) => d.count > 0).length;
	console.log(`${total} commits across ${activeDays} active days.`);

	const weekly = new Map<string, number>();
	for (const { date, count } of data) {
		const d = new Date(date);
		d.setDate(d.getDate() - d.getDay());
		const weekStart = d.toISOString().slice(0, 10);
		weekly.set(weekStart, (weekly.get(weekStart) ?? 0) + count);
	}

	const weeklyData = [...weekly.entries()]
		.map(([date, count]) => ({ date, count }))
		.sort((a, b) => a.date.localeCompare(b.date));

	activityChart(weeklyData);
}
