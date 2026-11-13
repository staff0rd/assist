import InputBase from "@mui/material/InputBase";
import { SlashSuggestionList } from "../../../../slashSuggestions/SlashSuggestionList";
import { sdkComposerSx } from "./sdkComposerSx";
import type { useSdkComposer } from "./useSdkComposer";

export function SdkComposerField({
	c,
}: {
	c: ReturnType<typeof useSdkComposer>;
}) {
	const { slash } = c;
	return (
		<>
			{slash.suggestions && (
				<SlashSuggestionList
					suggestions={slash.suggestions}
					onPick={slash.pick}
				/>
			)}
			<InputBase
				multiline
				maxRows={6}
				value={c.text}
				inputRef={slash.inputRef}
				disabled={!c.enabled}
				onChange={(e) => slash.edit(e.target)}
				onSelect={(e) => slash.trackCursor(e.target as HTMLTextAreaElement)}
				onKeyDown={c.onKeyDown}
				placeholder={c.placeholder}
				sx={sdkComposerSx.field}
				inputProps={{ "aria-label": "Message Claude" }}
			/>
		</>
	);
}
