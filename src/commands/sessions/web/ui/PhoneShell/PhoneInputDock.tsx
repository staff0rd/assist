import Box from "@mui/material/Box";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessCapability } from "../../../../../shared/harnessAdapters/harnessCapability";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { PhoneKeyStrip } from "./PhoneKeyStrip";
import { PhoneReplyBar, type ReplyStop } from "./PhoneReplyBar";
import { useSlashCommands } from "./PhoneSlashSuggestions/useSlashCommands";

type Props = {
	harness?: HarnessKind;
	cwd?: string;
	node?: string;
	waiting: boolean;
	keyboardOpen: boolean;
	onKey?: (data: string) => void;
	onSend: (text: string) => void;
	stop?: ReplyStop;
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
}: Props) {
	const suggest = harnessCapability(harness, "slashCommands.suggest").supported;
	const commands = useSlashCommands(suggest ? cwd : undefined, node);
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
			/>
		</Box>
	);
}
