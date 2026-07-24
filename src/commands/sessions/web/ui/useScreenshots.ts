import { useCallback, useRef, useState } from "react";

export type LocalScreenshot = { markdown: string; url: string; id: number };

export function useScreenshots() {
	const [screenshots, setScreenshots] = useState<LocalScreenshot[]>([]);
	const nextId = useRef(0);

	const add = useCallback((s: { markdown: string; url: string }) => {
		setScreenshots((ss) => [...ss, { ...s, id: nextId.current++ }]);
	}, []);

	const remove = useCallback((id: number) => {
		setScreenshots((ss) => {
			const target = ss.find((s) => s.id === id);
			if (target) URL.revokeObjectURL(target.url);
			return ss.filter((s) => s.id !== id);
		});
	}, []);

	return { screenshots, add, remove };
}
