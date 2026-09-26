import { useState } from "react";
import { useNavigate } from "react-router";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { formatItemId } from "../../../formatItemId";
import type { AssistLaunchMeta } from "../../../../sessions/web/ui/createSessionAction";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { useRepoCwd } from "../useRepoCwd";

export function useRefineLaunch(itemId: number) {
	const { launchAssist } = useSessionLaunchContext();
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	const node = useApiNode();
	const [launched, setLaunched] = useState(false);

	const launch = (harnessArgs: string[]) => {
		if (launched) return;
		setLaunched(true);
		const meta: [AssistLaunchMeta?] = node ? [{ node }] : [];
		launchAssist(
			["refine", "--once", ...harnessArgs, formatItemId(itemId)],
			cwd,
			...meta,
		);
		navigate("/sessions");
	};

	return { launched, launch };
}
