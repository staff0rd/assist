import { useCallback } from "react";
import {
	clearPersistedScreenshots,
	type PersistedScreenshot,
	savePersistedScreenshots,
} from "./loadPersistedScreenshots";
import { useSeededScreenshots } from "./useSeededScreenshots";
import type { PreviewAttachment } from "../../../../../../shared/PreviewAttachment";

export type LocalScreenshot = PersistedScreenshot & {
	url: string;
	id: number;
};

export function useScreenshots(
	scope: string | undefined,
	requestId: string,
	seeds: PreviewAttachment[],
) {
	const { screenshots, setScreenshots, nextId } = useSeededScreenshots(
		scope,
		requestId,
		seeds,
	);

	const add = useCallback(
		(s: Omit<LocalScreenshot, "id">) => {
			setScreenshots((ss) => {
				const next = [...ss, { ...s, id: nextId.current++ }];
				savePersistedScreenshots(scope, next);
				return next;
			});
		},
		[scope, setScreenshots, nextId],
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
		[scope, setScreenshots],
	);

	const clearPersisted = useCallback(
		() => clearPersistedScreenshots(scope),
		[scope],
	);

	return { screenshots, add, remove, clearPersisted };
}
