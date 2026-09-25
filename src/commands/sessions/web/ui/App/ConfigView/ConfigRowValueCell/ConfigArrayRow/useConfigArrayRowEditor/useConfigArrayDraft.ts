import { useState } from "react";
import type { ConfigScope } from "../../saveConfigValue";

export type ConfigArrayDraft = {
	index: number;
	value: unknown;
	scope: ConfigScope;
};

export function useConfigArrayDraft() {
	const [current, setCurrent] = useState<ConfigArrayDraft | undefined>(
		undefined,
	);

	return {
		current,
		openAt: (index: number, value: unknown, scope: ConfigScope) =>
			setCurrent({ index, value, scope }),
		close: () => setCurrent(undefined),
		setValue: (value: unknown) =>
			setCurrent((draft) => draft && { ...draft, value }),
		setScope: (scope: ConfigScope) =>
			setCurrent((draft) => draft && { ...draft, scope }),
	};
}
