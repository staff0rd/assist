import blessed from "blessed";
import contrib from "blessed-contrib";

type DayCount = { date: string; count: number };

export function activityChart(
	data: DayCount[],
	range: { since: string; until: string },
): void {
	const screen = blessed.screen({
		smartCSR: true,
		title: "Commit Activity",
	});

	const grid = new contrib.grid({ rows: 1, cols: 1, screen });

	const labels = data.map((d) => d.date.slice(5));
	const values = data.map((d) => d.count);

	const line = grid.set(0, 0, 1, 1, contrib.line, {
		label: ` Commits per week · ${range.since} → ${range.until} (press q to close) `,
		showLegend: true,
		legend: { width: 12 },
		xLabelPadding: 3,
		xPadding: 5,
		wholeNumbersOnly: true,
	});

	line.setData([
		{
			title: "Commits",
			x: labels,
			y: values,
			style: { line: "green" },
		},
	]);

	screen.key(["q", "C-c", "escape"], () => {
		screen.destroy();
	});

	screen.render();
}
