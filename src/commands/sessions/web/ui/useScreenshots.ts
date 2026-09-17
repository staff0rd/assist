import { useCallback, useEffect, useRef, useState } from "react";
import {
	clearPersistedScreenshots,
	loadPersistedScreenshots,
	savePersistedScreenshots,
} from "./loadPersistedScreenshots";
import { screenshotPreviewUrl } from "./screenshotPreviewUrl";

export type LocalScreenshot = {
	markdown: string;
	url: string;
	contentType: string;
	id: number;
};

export function useScreenshots(scope: string | undefined) {
	const [screenshots, setScreenshots] = useState<LocalScreenshot[]>([]);
	const nextId = useRef(0);

	useEffect(() => {
		setScreenshots(
			loadPersistedScreenshots(scope).map((s) => ({
				...s,
				url: screenshotPreviewUrl(s.markdown),
				id: nextId.current++,
			})),
		);
	}, [scope]);

	const add = useCallback(
		(s: Omit<LocalScreenshot, "id">) => {
			setScreenshots((ss) => {
				const next = [...ss, { ...s, id: nextId.current++ }];
				savePersistedScreenshots(scope, next);
				return next;
			});
		},
		[scope],
	);

	const remove = useCallback(
		(id: number) => {
			setScreenshots((ss) => {
				const target = ss.find((s) => s.id === id);
				if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
				const next = ss.filter((s) => s.id !== id);
				savePersistedScreenshots(scope, next);
				return next;
			});
		},
		[scope],
	);

	const clearPersisted = useCallback(
		() => clearPersistedScreenshots(scope),
		[scope],
	);

	return { screenshots, add, remove, clearPersisted };
}
