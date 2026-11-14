import InputBase from "@mui/material/InputBase";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import { ShellModeChip } from "../App/SessionContent/SessionArea/SdkComposer/ShellModeChip";
import type { useShellMode } from "../App/SessionContent/SessionArea/SdkComposer/useShellMode";
import { shellSx } from "../App/SessionContent/SessionArea/TranscriptArea/shellSx";
import type { useSlashReply } from "./PhoneSlashSuggestions/useSlashReply";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

export function PhoneReplyField({
	reply,
	harness,
	locked,
	shell,
}: {
	reply: ReturnType<typeof useSlashReply>;
	harness?: HarnessKind;
	locked?: string;
	shell: ReturnType<typeof useShellMode>;
}) {
	return (
		<InputBase
			multiline
			maxRows={5}
			value={reply.text}
			inputRef={reply.inputRef}
			onChange={(e) => {
				shell.enter(e.target);
				reply.edit(e.target);
			}}
			onKeyDown={(e) => shell.leaveOnBackspace(e, reply.text)}
			onSelect={(e) => reply.trackCursor(e.target as HTMLTextAreaElement)}
			disabled={Boolean(locked)}
			placeholder={
				locked ??
				(shell.shell ? "Shell command" : `Reply to ${harnessLabel(harness)}…`)
			}
			startAdornment={shell.shell && <ShellModeChip label="!" />}
			sx={[phoneReplyBarSx.field, shell.shell && shellSx.field]}
			inputProps={{ "aria-label": shell.shell ? "Shell command" : "Reply" }}
		/>
	);
}
