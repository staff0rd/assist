import { useEffect, useState } from "react";
import {
	type HarnessCapabilities,
	noHarnessCapabilities,
} from "../../sessions/web/ui/parseHarnessCapabilities";
import type { AssistHarnessResult } from "./isAssistHarnessMessage";
import { sendRuntimeMessage } from "./sendRuntimeMessage";

export function useAssistHarness(): HarnessCapabilities {
	const [capabilities, setCapabilities] = useState(noHarnessCapabilities);

	useEffect(() => {
		let cancelled = false;
		void sendRuntimeMessage<AssistHarnessResult>({
			type: "assist-harness",
		}).then((result) => {
			if (!cancelled && result.ok && result.capabilities)
				setCapabilities(result.capabilities);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	return capabilities;
}
