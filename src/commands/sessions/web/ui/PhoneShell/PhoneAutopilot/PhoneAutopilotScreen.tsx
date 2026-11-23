import Box from "@mui/material/Box";
import { useEffect } from "react";
import { repoName } from "../../repoName";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneRepoSelect } from "../PhoneBacklog/PhoneRepoSelect";
import { PhoneNavBar } from "../PhoneNavBar";
import { phoneScrollAttr } from "../PhoneNavStack/phoneScrollAttr";
import { PhoneAutopilotBody } from "./PhoneAutopilotBody";
import { phoneAutopilotSx as sx } from "./phoneAutopilotSx";
import { usePhoneAutopilotContext } from "./usePhoneAutopilotContext";

const choice = (cwd: string) => ({
	origin: cwd,
	displayName: repoName(cwd),
	cwd,
});

export function PhoneAutopilotScreen({ socket }: { socket: SessionSocket }) {
	const autopilot = usePhoneAutopilotContext();
	const { requestHistory } = socket;
	useEffect(() => requestHistory(), [requestHistory]);
	if (!autopilot) return null;
	const { repos, cwd, pick } = autopilot;

	return (
		<>
			<PhoneNavBar title="Autopilot" />
			{repos.length > 1 && (
				<PhoneRepoSelect
					repos={repos.map(choice)}
					repo={choice(cwd)}
					onPick={pick}
				/>
			)}
			<Box sx={sx.body} {...phoneScrollAttr}>
				<PhoneAutopilotBody autopilot={autopilot} />
			</Box>
		</>
	);
}
