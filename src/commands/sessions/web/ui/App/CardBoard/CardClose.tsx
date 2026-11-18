import Box from "@mui/material/Box";
import { CardCloseActions } from "../AppSidebar/SessionCard/CardHeader/CardHeaderActions/CardActionButtons/CardCloseActions";
import { sessionActionHandlers } from "../sessionActionHandlers";
import { StopCardActivation } from "../../StopCardActivation";
import type { SessionInfo } from "../../types";
import { useBoardActionsContext } from "./useBoardActionsContext";

export function CardClose({ session }: { session: SessionInfo }) {
	const actions = sessionActionHandlers(session, useBoardActionsContext());
	return (
		<Box
			component="span"
			sx={{ ml: "auto", my: -0.5, display: "flex", flexShrink: 0 }}
		>
			<StopCardActivation>
				<CardCloseActions
					session={session}
					onRestart={actions.onRestart}
					onStartOver={actions.onStartOver}
					onDismiss={actions.onDismiss}
				/>
			</StopCardActivation>
		</Box>
	);
}
