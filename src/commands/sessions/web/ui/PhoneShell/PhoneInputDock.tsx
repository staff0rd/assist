import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { PhoneKeyStrip } from "./PhoneKeyStrip";
import { PhoneReplyBar, type ReplyStop } from "./PhoneReplyBar";
import { useSuggestedSlashCommands } from "../slashSuggestions/useSuggestedSlashCommands";

type Props = {
	harness?: HarnessKind;
	cwd?: string;
	node?: string;
	waiting: boolean;
	keyboardOpen: boolean;
	onKey?: (data: string) => void;
	onSend: (text: string) => void;
	stop?: ReplyStop;
	locked?: string;
};

export function PhoneInputDock({
	harness,
	cwd,
	node,
	waiting,
	keyboardOpen,
	onKey,
	onSend,
	stop,
	locked,
}: Props) {
	const commands = useSuggestedSlashCommands(harness, cwd, node);
	return (
		<Box
			sx={{
				flex: "none",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.paper",
				pb: keyboardOpen ? 0 : safeAreaInsets.bottom,
			}}
		>
			{onKey && (
				<Box sx={{ order: keyboardOpen ? 1 : 0 }}>
					<PhoneKeyStrip waiting={waiting} onKey={onKey} />
				</Box>
			)}
			<PhoneReplyBar
				harness={harness}
				commands={commands}
				onSend={onSend}
				stop={stop}
				locked={locked}
			/>
		</Box>
	);
}
