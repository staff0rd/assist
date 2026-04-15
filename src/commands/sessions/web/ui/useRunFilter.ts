import { useMemo, useState } from "react";
import { matchesFilter } from "./matchesFilter";
import type { RunConfigInfo } from "./types";

export function useRunFilter(runConfigs: RunConfigInfo[]) {
	const [runFilter, setRunFilter] = useState("");

	const filteredRunConfigs = useMemo(
		() => runConfigs.filter((c) => matchesFilter(c.name, runFilter)),
		[runConfigs, runFilter],
	);

	return { runFilter, setRunFilter, filteredRunConfigs };
}
