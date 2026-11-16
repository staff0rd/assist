import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useNavigate } from "react-router";
import { sessionTitle } from "../App/sessionTitle";
import { displayStatus } from "../displayStatus";
import type { SessionInfo } from "../types";
import { PhoneSwipeRow } from "./PhoneActions/PhoneSwipeRow";
import {
	phoneRowChevronSx,
	phoneRowMessageSx,
	phoneRowSx,
	phoneRowTitleSx,
} from "./phoneRowSx";
import { attentionMessage } from "./attentionMessage";
import { transferIndicator } from "../transfer/transferIndicator";
import { PhoneRowGlyph } from "./PhoneRowGlyph";
import { PhoneRowMeta } from "./PhoneRowMeta";

export function PhoneSessionRow({
	session,
	localNode,
	showMessage,
	hideRepo,
}: {
	session: SessionInfo;
	localNode: string | undefined;
	showMessage?: boolean;
	hideRepo?: boolean;
}) {
	const navigate = useNavigate();
	const status = displayStatus(session);
	const message = showMessage ? attentionMessage(session) : undefined;
	const transfer = transferIndicator(session);

	return (
		<PhoneSwipeRow session={session}>
			{(consumeClick) => (
				<ButtonBase
					sx={phoneRowSx(status, transfer?.tone)}
					onClick={() => {
						if (!consumeClick()) navigate(`/session/${session.id}`);
					}}
					data-testid="phone-session-row"
				>
					<PhoneRowGlyph status={status} transfer={transfer} />
					<Box sx={phoneRowTitleSx}>{sessionTitle(session)}</Box>
					<ChevronRightIcon fontSize="small" sx={phoneRowChevronSx} />
					<PhoneRowMeta
						session={session}
						localNode={localNode}
						hideRepo={hideRepo}
						transfer={transfer}
					/>
					{message && <Box sx={phoneRowMessageSx}>{message}</Box>}
				</ButtonBase>
			)}
		</PhoneSwipeRow>
	);
}
