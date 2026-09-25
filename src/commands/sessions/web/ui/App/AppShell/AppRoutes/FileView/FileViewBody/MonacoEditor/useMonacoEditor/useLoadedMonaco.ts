import { useEffect, useState } from "react";
import { loadMonaco, type MonacoApi } from "../loadMonaco";

export function useLoadedMonaco(): { monaco?: MonacoApi; failed: boolean } {
	const [monaco, setMonaco] = useState<MonacoApi>();
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		loadMonaco().then(
			(api) => !cancelled && setMonaco(api),
			() => !cancelled && setFailed(true),
		);
		return () => {
			cancelled = true;
		};
	}, []);

	return { monaco, failed };
}
