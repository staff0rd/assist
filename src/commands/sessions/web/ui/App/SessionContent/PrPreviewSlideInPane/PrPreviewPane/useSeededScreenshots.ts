import { useEffect, useRef, useState } from "react";
import type { PreviewAttachment } from "../../../../../../shared/PreviewAttachment";
import { useApiNode } from "../../../../useApiNode";
import type { LocalScreenshot } from "./useScreenshots";
import { seedScreenshots } from "./useSeededScreenshots/seedScreenshots";
import { stagedPreviewSrc } from "./useSeededScreenshots/stagedPreviewSrc";

export function useSeededScreenshots(
	scope: string | undefined,
	requestId: string,
	seeds: PreviewAttachment[],
) {
	const [screenshots, setScreenshots] = useState<LocalScreenshot[]>([]);
	const nextId = useRef(0);
	const node = useApiNode();
	const seedsRef = useRef(seeds);
	seedsRef.current = seeds;

	useEffect(() => {
		setScreenshots(
			seedScreenshots(scope, requestId, seedsRef.current).map((s) => ({
				...s,
				url: stagedPreviewSrc(s.path, node),
				id: nextId.current++,
			})),
		);
	}, [scope, requestId, node]);

	return { screenshots, setScreenshots, nextId };
}
