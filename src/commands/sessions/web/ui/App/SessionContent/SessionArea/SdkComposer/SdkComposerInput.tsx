import InputBase from "@mui/material/InputBase";
import { shellSx } from "../TranscriptArea/shellSx";
import { ShellModeChip } from "./ShellModeChip";
import { sdkComposerSx } from "./sdkComposerSx";
import type { useComposerBackdrop } from "./useComposerBackdrop";
import type { useSdkComposer } from "./useSdkComposer";

export function SdkComposerInput({
	c,
	backdrop,
}: {
	c: ReturnType<typeof useSdkComposer>;
	backdrop: ReturnType<typeof useComposerBackdrop>;
}) {
	return (
		<InputBase
			multiline
			fullWidth
			maxRows={6}
			value={c.text}
			inputRef={c.slash.inputRef}
			disabled={!c.enabled}
			onChange={(e) => c.edit(e.target)}
			onSelect={(e) => c.slash.trackCursor(e.target as HTMLTextAreaElement)}
			onKeyDown={c.onKeyDown}
			placeholder={c.placeholder}
			startAdornment={c.shell && <ShellModeChip label="! shell" />}
			sx={[
				sdkComposerSx.field,
				backdrop.active && sdkComposerSx.fieldUnderBackdrop,
				c.shell && shellSx.field,
			]}
			inputProps={{
				"aria-label": c.shell ? "Shell command" : "Message Claude",
				onScroll: backdrop.onScroll,
			}}
		/>
	);
}
