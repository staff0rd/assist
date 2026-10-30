import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useNavigate } from "react-router";
import { SessionStatusGlyph } from "../App/AppSidebar/SessionCard/CardHeader/SessionStatusGlyph";
import { repoLabel } from "../App/repoLabel";
import { sessionTitle } from "../App/sessionTitle";
import { displayStatus } from "../displayStatus";
import type { SessionInfo } from "../types";
import { PhoneBadges } from "./PhoneBadges";
import { phaseLabel } from "./phaseLabel";
import {
	phoneRowChevronSx,
	phoneRowMessageSx,
	phoneRowMetaSx,
	phoneRowSx,
	phoneRowTitleSx,
} from "./phoneRowSx";

function attentionMessage(session: SessionInfo): string | undefined {
	if (session.status === "error") return session.error;
	return session.pendingPrPreview?.title ?? session.lastAssistantMessage;
}

export function PhoneSessionRow({
	session,
	localNode,
	showMessage,
}: {
	session: SessionInfo;
	localNode: string | undefined;
	showMessage?: boolean;
}) {
	const navigate = useNavigate();
	const status = displayStatus(session);
	const repo = repoLabel(session.cwd);
	const phase = phaseLabel(session);
	const message = showMessage ? attentionMessage(session) : undefined;

	return (
		<ButtonBase
			sx={phoneRowSx(status)}
			onClick={() => navigate(`/session/${session.id}`)}
			data-testid="phone-session-row"
		>
			<SessionStatusGlyph status={status} />
			<Box sx={phoneRowTitleSx}>{sessionTitle(session)}</Box>
			<ChevronRightIcon fontSize="small" sx={phoneRowChevronSx} />
			<Box sx={phoneRowMetaSx}>
				{repo && <span>{repo}</span>}
				{phase && <span>{phase}</span>}
				<PhoneBadges session={session} localNode={localNode} />
			</Box>
			{message && <Box sx={phoneRowMessageSx}>{message}</Box>}
		</ButtonBase>
	);
}
