import { useCallback, useState } from "react";

export function useNotices() {
	const [back, setBack] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState<Record<string, string>>({});

	const mark = useCallback((name: string, label?: string) => {
		setBusy((current) => {
			const next = { ...current };
			if (label) next[name] = label;
			else delete next[name];
			return next;
		});
	}, []);

	return {
		busy,
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
