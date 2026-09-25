import { useEffect, useState } from "react";

type FileSearchState = {
	files: string[];
	loading: boolean;
	error: boolean;
};

const idle: FileSearchState = { files: [], loading: false, error: false };

export function useFileSearch(cwd: string, query: string): FileSearchState {
	const [state, setState] = useState<FileSearchState>(idle);

	useEffect(() => {
		if (!cwd) {
			setState(idle);
			return;
		}
		let cancelled = false;
		setState((previous) => ({ ...previous, loading: true }));
		const search = async () => {
			try {
				const res = await fetch(
					`/api/files?cwd=${encodeURIComponent(cwd)}&q=${encodeURIComponent(query)}`,
				);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const body = await res.json();
				if (cancelled) return;
				setState({
					files: Array.isArray(body.files) ? body.files : [],
					loading: false,
					error: false,
				});
			} catch {
				if (!cancelled) setState({ files: [], loading: false, error: true });
			}
		};
		search();
		return () => {
			cancelled = true;
		};
	}, [cwd, query]);

	return state;
}
