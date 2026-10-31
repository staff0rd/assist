import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { NodeDot } from "../../HomeNodeGate/NodeDot";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { phoneUpdateState } from "../PhoneNodeUpdates/phoneUpdateState";
import type { PhoneNodeUpdates } from "../PhoneNodeUpdates/usePhoneNodeUpdates";

type Props = {
	updates: PhoneNodeUpdates;
	onOpen: (name: string) => void;
};

export function PhoneNodeUpdatesGroup({ updates, onOpen }: Props) {
	const { entries, latest, notices } = updates;
	if (entries.length === 0) return null;
	return (
		<>
			<Box sx={nodeListSx.label}>Updates</Box>
			<Box sx={nodeListSx.group}>
				{entries.map((entry) => {
					const state = phoneUpdateState(entry, latest);
					const busy = notices.busy[entry.name];
					return (
						<ButtonBase
							key={entry.name}
							sx={nodeListSx.item}
							onClick={() => onOpen(entry.name)}
							data-testid={`phone-update-row-${entry.name}`}
						>
							<NodeDot tone={state.tone} />
							<Box component="span" sx={nodeListSx.grow}>
								{entry.name}
								<Box component="span" sx={nodeListSx.detail}>
									{state.detail}
								</Box>
							</Box>
							<Box component="span" sx={nodeListSx.end}>
								{busy && `${busy}…`}
								<ChevronRightIcon />
							</Box>
						</ButtonBase>
					);
				})}
			</Box>
		</>
	);
}
