import { useCallback, useState } from "react";

function withMarker<T>(
	current: Record<string, T>,
	name: string,
	value: T | undefined,
): Record<string, T> {
	const next = { ...current };
	if (value === undefined) delete next[name];
	else next[name] = value;
	return next;
}

export function useNotices() {
	const [back, setBack] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState<Record<string, string>>({});
	const [busySince, setBusySince] = useState<Record<string, number>>({});

	const mark = useCallback((name: string, label?: string) => {
		setBusy((current) => withMarker(current, name, label));
		setBusySince((current) =>
			withMarker(current, name, label ? Date.now() : undefined),
		);
	}, []);

	return {
		busy,
		busySince,
		mark,
		back,
		setBack,
		clearBack: () => setBack(null),
		error,
		setError,
		clearError: () => setError(null),
	};
}

export type Notices = ReturnType<typeof useNotices>;
