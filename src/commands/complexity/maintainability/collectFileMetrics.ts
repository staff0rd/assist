import fs from "node:fs";
import {
	calculateCyclomaticComplexity,
	calculateHalstead,
	countSloc,
	forEachFunction,
} from "../shared";
import { calculateMaintainabilityIndex } from "./calculateMaintainabilityIndex";
import { parseMaintainabilityOverride } from "./parseMaintainabilityOverride";

export type FileMetrics = Map<
	string,
	{
		sloc: number;
		functions: number[];
		override: number | undefined;
		largestFunction: string;
		largestFunctionSize: number;
	}
>;

export function collectFileMetrics(files: string[]): FileMetrics {
	const fileMetrics: FileMetrics = new Map();

	for (const file of files) {
		const content = fs.readFileSync(file, "utf8");
		fileMetrics.set(file, {
			sloc: countSloc(content),
			functions: [],
			override: parseMaintainabilityOverride(content),
			largestFunction: "",
			largestFunctionSize: -1,
		});
	}

	forEachFunction(files, (file, name, node) => {
		const metrics = fileMetrics.get(file);
		if (metrics) {
			const complexity = calculateCyclomaticComplexity(node);
			const halstead = calculateHalstead(node);
			const mi = calculateMaintainabilityIndex(
				halstead.volume,
				complexity,
				metrics.sloc,
			);
			metrics.functions.push(mi);

			const size = node.end - node.pos;
			if (size > metrics.largestFunctionSize) {
				metrics.largestFunctionSize = size;
				metrics.largestFunction = name;
			}
		}
	});

	return fileMetrics;
}
