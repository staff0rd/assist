import Box from "@mui/material/Box";
import type { SessionInfo } from "../../../types";
import type { InterruptSession } from "./LiveTranscriptArea";
import { SdkComposerActions } from "./SdkComposer/SdkComposerActions";
import { SdkComposerField } from "./SdkComposer/SdkComposerField";
import { SdkComposerHint } from "./SdkComposer/SdkComposerHint";
import { sdkComposerSx } from "./SdkComposer/sdkComposerSx";
import { cwdLabel } from "./SdkComposer/cwdLabel";
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
					<SdkComposerField c={c} />
					<SdkComposerActions
						running={c.running}
						stopping={c.stopping}
						shell={c.shell}
						canSend={c.enabled && Boolean(c.text.trim())}
						onStop={c.stop}
						onSend={c.send}
					/>
				</Box>
				<SdkComposerHint
					running={c.running}
					stopping={c.stopping}
					suggestion={Boolean(c.suggestion)}
					shellCwd={c.shell ? cwdLabel(session.cwd) : undefined}
					held={c.held}
					shellRunning={c.shellRunning}
				/>
			</Box>
		</Box>
	);
}
