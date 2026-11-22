import { useState } from "react";
import {
	type AutopilotAction,
	postAutopilotControl,
} from "./postAutopilotControl";

export function useAutopilotActions(
	cwd: string,
	node: string | undefined,
	refresh: () => Promise<void>,
) {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string>();

	const run = async (action: AutopilotAction) => {
		setBusy(true);
		setError(undefined);
		try {
			await postAutopilotControl(cwd, action, node);
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
		} finally {
			setBusy(false);
			await refresh();
		}
	};

	return { busy, error, run };
}
