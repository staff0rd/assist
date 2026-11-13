import InputBase from "@mui/material/InputBase";
import type { HarnessKind } from "../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../shared/harnessAdapters/harnessLabel";
import type { useSlashReply } from "./PhoneSlashSuggestions/useSlashReply";
import { phoneReplyBarSx } from "./phoneReplyBarSx";

export function PhoneReplyField({
	reply,
	harness,
	locked,
}: {
	reply: ReturnType<typeof useSlashReply>;
	harness?: HarnessKind;
	locked?: string;
}) {
	return (
		<InputBase
			multiline
			maxRows={5}
			value={reply.text}
			inputRef={reply.inputRef}
			onChange={(e) => reply.edit(e.target)}
			onSelect={(e) => reply.trackCursor(e.target as HTMLTextAreaElement)}
			disabled={Boolean(locked)}
			placeholder={locked ?? `Reply to ${harnessLabel(harness)}…`}
			sx={phoneReplyBarSx.field}
			inputProps={{ "aria-label": "Reply" }}
		/>
	);
}
