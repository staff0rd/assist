import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import type { UpdateState } from "../UpdateStateKind";
import type { UpdateActions } from "../useUpdateActions";
import { Advice } from "./NodeUpdateDetail/Advice";
import { History } from "./NodeUpdateDetail/History";
import { useLiveHistory } from "./NodeUpdateDetail/useLiveHistory";

export function NodeUpdateDetail({
	entry,
	state,
	actions,
}: {
	entry: NodeUpdateEntry;
	state: UpdateState;
	actions: UpdateActions;
}) {
	const history = useLiveHistory(entry);
	return (
		<Box
			sx={{
				px: 2,
				pb: 2,
				pl: { xs: 2, sm: 7.5 },
				display: "grid",
				gap: 1.5,
			}}
		>
			<Advice entry={entry} state={state} actions={actions} />
			<Typography variant="caption" color="text.secondary">
				History · ~/.assist/watchers/
			</Typography>
			<History lines={history} />
		</Box>
	);
}
