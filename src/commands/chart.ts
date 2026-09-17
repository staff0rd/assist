import { renderLineChart } from "../lib/renderLineChart";
import { parseChartSeries } from "./chart/parseChartSeries";
import { readStdinLines } from "./chart/readStdinLines";

export async function chart(options: { title?: string }): Promise<void> {
	const lines = await readStdinLines();

	let points: ReturnType<typeof parseChartSeries>;
	try {
		points = parseChartSeries(lines);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}

	if (points.length < 2) {
		console.log("Not enough data points to chart.");
		return;
	}

	const title = options.title ?? "Chart";

	renderLineChart({
		title,
		label: title,
		seriesTitle: title,
		labels: points.map((p) => p.label),
		values: points.map((p) => p.value),
	});
}
