import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { SlashSuggestionList } from "../../../../slashSuggestions/SlashSuggestionList";
import { SdkComposerBackdrop } from "./SdkComposerBackdrop";
import { sdkComposerSx } from "./sdkComposerSx";
import { useComposerAutofocus } from "./useComposerAutofocus";
import { useComposerBackdrop } from "./useComposerBackdrop";
import type { useSdkComposer } from "./useSdkComposer";

export function SdkComposerField({
	c,
}: {
	c: ReturnType<typeof useSdkComposer>;
}) {
	const { slash } = c;
	const backdrop = useComposerBackdrop(c.text, c.commands, c.enabled);
	useComposerAutofocus(slash.inputRef, c.enabled);
	return (
		<>
			{slash.suggestions && (
				<SlashSuggestionList
					suggestions={slash.suggestions}
					onPick={slash.pick}
				/>
			)}
			<Box sx={sdkComposerSx.fieldWrap}>
				<InputBase
					multiline
					fullWidth
					maxRows={6}
					value={c.text}
					inputRef={slash.inputRef}
					disabled={!c.enabled}
					onChange={(e) => slash.edit(e.target)}
					onSelect={(e) => slash.trackCursor(e.target as HTMLTextAreaElement)}
					onKeyDown={c.onKeyDown}
					placeholder={c.placeholder}
					sx={[
						sdkComposerSx.field,
						backdrop.active && sdkComposerSx.fieldUnderBackdrop,
					]}
					inputProps={{
						"aria-label": "Message Claude",
						onScroll: backdrop.onScroll,
					}}
				/>
				{backdrop.active && (
					<SdkComposerBackdrop
						text={c.text}
						commands={c.commands}
						backdropRef={backdrop.backdropRef}
					/>
				)}
			</Box>
		</>
	);
}
