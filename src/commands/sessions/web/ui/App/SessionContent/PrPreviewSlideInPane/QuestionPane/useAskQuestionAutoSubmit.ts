import { useEffect, useState } from "react";
import { reportCaughtError } from "../../../../clientFailures/reportCaughtError";
import { saveConfigValue } from "../../../ConfigView/ConfigRowValueCell/saveConfigValue";
import { fetchEntries } from "../../../ConfigView/useConfigEntries/fetchEntries";
import { useApiNode } from "../../../../useApiNode";

const KEY = "sessions.askQuestionAutoSubmit";

export function useAskQuestionAutoSubmit(
	cwd: string | undefined,
): [boolean, (enabled: boolean) => void] {
	const node = useApiNode();
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		if (!cwd) return;
		let cancelled = false;
		fetchEntries(cwd, node)
			.then((entries) => {
				const entry = entries.find((e) => e.key === KEY);
				if (!cancelled) setEnabled(entry?.value === true);
			})
			.catch((error: unknown) =>
				reportCaughtError(error, "ask-question auto submit"),
			);
		return () => {
			cancelled = true;
		};
	}, [cwd, node]);

	const save = (next: boolean) => {
		if (!cwd) return;
		const previous = enabled;
		setEnabled(next);
		void saveConfigValue(
			{ key: KEY, value: next, cwd, scope: "global" },
			node,
		).then(({ error }) => {
			if (error) setEnabled(previous);
		});
	};

	return [enabled, save];
}
