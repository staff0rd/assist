import { useState } from "react";
import {
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../loadPersisted";

const PREFIX = "assist:high-level-tree:";
const NONE: ReadonlySet<string> = new Set();

export function useHighLevelCollapse(
	subject: string,
	defaults: ReadonlySet<string> = NONE,
): {
	collapsed: Set<string>;
	overrides: ReadonlySet<string>;
	onToggle: (path: string) => void;
	onSet: (paths: Iterable<string>, collapse: boolean) => void;
	onReset: (paths?: Iterable<string>) => void;
} {
	const key = `${PREFIX}${subject}`;
	const [overrides, setOverrides] = useState(() => {
		prunePersisted(PREFIX);
		return new Set(loadPersisted<string>(key));
	});
	const save = (next: Set<string>) => {
		savePersisted(key, [...next]);
		setOverrides(next);
	};

	return {
		collapsed: toggled(defaults, overrides),
		overrides,
		onToggle: (path) => save(toggled(overrides, [path])),
		onSet: (paths, collapse) => {
			const next = new Set(overrides);
			for (const path of paths)
				if (defaults.has(path) === collapse) next.delete(path);
				else next.add(path);
			save(next);
		},
		onReset: (paths) => {
			if (!paths) return save(new Set());
			const next = new Set(overrides);
			for (const path of paths) next.delete(path);
			save(next);
		},
	};
}

function toggled(base: Iterable<string>, flips: Iterable<string>): Set<string> {
	const result = new Set(base);
	for (const path of flips) if (!result.delete(path)) result.add(path);
	return result;
}
