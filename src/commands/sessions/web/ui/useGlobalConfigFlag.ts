import { useCallback, useEffect, useState } from "react";
import { reportCaughtError } from "./clientFailures/reportCaughtError";
import { saveConfigValue } from "./App/ConfigView/ConfigRowValueCell/saveConfigValue";
import { fetchEntries } from "./App/ConfigView/useConfigEntries/fetchEntries";
import { useApiNode } from "./useApiNode";

export function useGlobalConfigFlag(
	key: string,
	cwd: string | undefined,
): [boolean, (enabled: boolean) => void] {
	const node = useApiNode();
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		if (!cwd) return;
		let cancelled = false;
		fetchEntries(cwd, node)
			.then((entries) => {
				const entry = entries.find((e) => e.key === key);
				if (!cancelled) setEnabled(entry?.value === true);
			})
			.catch((error: unknown) => reportCaughtError(error, key));
		return () => {
			cancelled = true;
		};
	}, [key, cwd, node]);

	const save = useCallback(
		(next: boolean) => {
			if (!cwd) return;
			const previous = enabled;
			setEnabled(next);
			void saveConfigValue(
				{ key, value: next, cwd, scope: "global" },
				node,
			).then(({ error }) => {
				if (error) setEnabled(previous);
			});
		},
		[key, cwd, node, enabled],
	);

	return [enabled, save];
}
