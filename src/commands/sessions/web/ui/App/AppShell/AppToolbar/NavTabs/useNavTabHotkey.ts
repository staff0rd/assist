import { useCallback } from "react";
import { navTabIndex } from "../../../navTabIndex";
import { useCaptureHotkey } from "../../../useCaptureHotkey";
import { useShortcut } from "../../../useShortcut";

export function useNavTabHotkey(
	paths: readonly string[],
	goTo: (path: string) => void,
): void {
	const { bound } = useShortcut("navTab");
	const tabCount = paths.length;
	const matches = useCallback(
		(event: KeyboardEvent) =>
			(navTabIndex(event, bound) ?? tabCount) < tabCount,
		[bound, tabCount],
	);
	const onHotkey = useCallback(
		(event: KeyboardEvent) => {
			const path = paths[navTabIndex(event, bound) ?? -1];
			if (path) goTo(path);
		},
		[paths, goTo, bound],
	);
	useCaptureHotkey(matches, onHotkey);
}
