import { useCallback, useEffect, useState } from "react";
import { reportCaughtError } from "./clientFailures/reportCaughtError";
import { saveConfigValue } from "./App/ConfigView/ConfigRowValueCell/saveConfigValue";
import { fetchEntries } from "./App/ConfigView/useConfigEntries/fetchEntries";
import { useApiNode } from "./useApiNode";

export function useGlobalConfigValue<T>(
	key: string,
	cwd: string | undefined,
	parse: (raw: unknown) => T,
	localOnly = false,
): [T, (next: T) => void, boolean] {
	const apiNode = useApiNode();
	const node = localOnly ? undefined : apiNode;
	const [value, setValue] = useState<T>(() => parse(undefined));
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (!cwd) return;
		let cancelled = false;
		setLoaded(false);
		fetchEntries(cwd, node)
			.then((entries) => {
				const entry = entries.find((e) => e.key === key);
				if (!cancelled) setValue(parse(entry?.value));
			})
			.catch((error: unknown) => reportCaughtError(error, key))
			.finally(() => {
				if (!cancelled) setLoaded(true);
			});
		return () => {
			cancelled = true;
		};
	}, [key, cwd, node, parse]);

	const save = useCallback(
		(next: T) => {
			if (!cwd) return;
			const previous = value;
			setValue(next);
			void saveConfigValue(
				{ key, value: next, cwd, scope: "global" },
				node,
			).then(({ error }) => {
				if (error) setValue(previous);
			});
		},
		[key, cwd, node, value],
	);

	return [value, save, loaded];
}
