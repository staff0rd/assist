import { useCallback } from "react";
import { navTabIndex } from "../../../navTabIndex";
import { useCaptureHotkey } from "../../../useCaptureHotkey";

export function useNavTabHotkey(
	paths: readonly string[],
	goTo: (path: string) => void,
): void {
	const tabCount = paths.length;
	const matches = useCallback(
		(event: KeyboardEvent) => (navTabIndex(event) ?? tabCount) < tabCount,
		[tabCount],
	);
	const onHotkey = useCallback(
		(event: KeyboardEvent) => {
			const path = paths[navTabIndex(event) ?? -1];
			if (path) goTo(path);
		},
		[paths, goTo],
	);
	useCaptureHotkey(matches, onHotkey);
}
