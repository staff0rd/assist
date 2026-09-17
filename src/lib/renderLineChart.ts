import * as fs from "node:fs";
import * as tty from "node:tty";
import blessed from "blessed";
import contrib from "blessed-contrib";

type LineChartOptions = {
	title: string;
	label: string;
	seriesTitle: string;
	labels: string[];
	values: number[];
	wholeNumbersOnly?: boolean;
	minY?: number;
	maxY?: number;
};

const keyboardInput = (): tty.ReadStream | undefined => {
	if (process.stdin.isTTY) return undefined;

	try {
		return new tty.ReadStream(fs.openSync("/dev/tty", "r"));
	} catch {
		return undefined;
	}
};

export function renderLineChart({
	title,
	label,
	seriesTitle,
	labels,
	values,
	wholeNumbersOnly = false,
	minY,
	maxY,
}: LineChartOptions): void {
	const input = keyboardInput();

	const screen = blessed.screen({
		smartCSR: true,
		title,
		input,
	});

	const grid = new contrib.grid({ rows: 1, cols: 1, screen });

	const line = grid.set(0, 0, 1, 1, contrib.line, {
		label: ` ${label} (press q to close) `,
		showLegend: true,
		legend: { width: Math.max(12, seriesTitle.length + 2) },
		xLabelPadding: 3,
		xPadding: 5,
		wholeNumbersOnly,
		minY,
		maxY,
	});

	line.setData([
		{
			title: seriesTitle,
			x: labels,
			y: values,
			style: { line: "green" },
		},
	]);

	screen.key(["q", "C-c", "escape"], () => {
		screen.destroy();
		input?.destroy();
	});

	screen.render();
}
