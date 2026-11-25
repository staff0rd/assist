import { useEffect, useRef } from "react";
import { useGlobalConfigFlag } from "../../../../useGlobalConfigFlag";

type AfterLoad = (enabled: boolean) => void;

export function useAskQuestionAutoSubmit(cwd: string | undefined) {
	const [enabled, setEnabled, loaded] = useGlobalConfigFlag(
		"sessions.askQuestionAutoSubmit",
		cwd,
	);
	const queued = useRef<AfterLoad | undefined>(undefined);

	useEffect(() => {
		if (!loaded || !queued.current) return;
		const run = queued.current;
		queued.current = undefined;
		run(enabled);
	}, [loaded, enabled]);

	/* why: the flag loads from /api/config after the pane mounts, so a pick made
	 * before it arrives would read the default (off) and never auto-submit */
	const whenLoaded = (run: AfterLoad) => {
		if (loaded) run(enabled);
		else queued.current = run;
	};
	const cancel = () => {
		queued.current = undefined;
	};

	return { enabled, setEnabled, whenLoaded, cancel };
}
