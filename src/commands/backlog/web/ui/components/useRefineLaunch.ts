import { useState } from "react";
import { useNavigate } from "react-router";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { formatItemId } from "../../../formatItemId";
import { useRepoCwd } from "../useRepoCwd";

export function useRefineLaunch(itemId: number) {
	const { launchAssist } = useSessionLaunchContext();
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	const [launched, setLaunched] = useState(false);

	const launch = (harnessArgs: string[]) => {
		if (launched) return;
		setLaunched(true);
		launchAssist(
			["refine", "--once", ...harnessArgs, formatItemId(itemId)],
			cwd,
		);
		navigate("/sessions");
	};

	return { launched, launch };
}
