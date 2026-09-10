import { useCallback, useRef, useState } from "react";

export type LocalScreenshot = {
	markdown: string;
	url: string;
	contentType: string;
	id: number;
};

export function useScreenshots() {
	const [screenshots, setScreenshots] = useState<LocalScreenshot[]>([]);
	const nextId = useRef(0);

	const add = useCallback((s: Omit<LocalScreenshot, "id">) => {
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
