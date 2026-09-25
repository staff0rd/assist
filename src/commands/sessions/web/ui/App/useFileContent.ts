import { useEffect, useState } from "react";
import { type FileContentState, fetchFileContent } from "./fetchFileContent";

export function useFileContent(
	cwd: string | undefined,
	path: string,
): FileContentState {
	const [state, setState] = useState<FileContentState>({ status: "loading" });

	useEffect(() => {
		if (!cwd) {
			setState({ status: "error" });
			return;
		}
		let cancelled = false;
		setState({ status: "loading" });
		fetchFileContent(cwd, path).then((next) => {
			if (!cancelled) setState(next);
		});
		return () => {
			cancelled = true;
		};
	}, [cwd, path]);

	return state;
}
