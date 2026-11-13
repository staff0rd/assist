import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import type { SessionInfo } from "../../../types";
import type { InterruptSession } from "./LiveTranscriptArea";
import { SdkComposerActions } from "./SdkComposer/SdkComposerActions";
import { SdkComposerHint } from "./SdkComposer/SdkComposerHint";
import { sdkComposerSx } from "./SdkComposer/sdkComposerSx";
import { useSdkComposer } from "./SdkComposer/useSdkComposer";

export function SdkComposer({
	session,
	sendInput,
	interruptSession,
}: {
	session: SessionInfo;
	sendInput: (sessionId: string, data: string) => void;
	interruptSession: InterruptSession;
}) {
	const c = useSdkComposer(session, sendInput, interruptSession);
	return (
		<Box sx={sdkComposerSx.bar}>
			<Box sx={sdkComposerSx.inner}>
				<Box sx={sdkComposerSx.row}>
					<InputBase
						multiline
						maxRows={6}
						value={c.text}
						disabled={!c.enabled}
						onChange={(e) => c.setText(e.target.value)}
						onKeyDown={c.onKeyDown}
						placeholder={c.placeholder}
						sx={sdkComposerSx.field}
						inputProps={{ "aria-label": "Message Claude" }}
					/>
					<SdkComposerActions
						running={c.running}
						stopping={c.stopping}
						canSend={c.enabled && Boolean(c.text.trim())}
						onStop={c.stop}
						onSend={c.send}
					/>
				</Box>
				<SdkComposerHint running={c.running} stopping={c.stopping} />
			</Box>
		</Box>
	);
}
