import Box from "@mui/material/Box";
import { SlashSuggestionList } from "../../../../slashSuggestions/SlashSuggestionList";
import { SdkComposerBackdrop } from "./SdkComposerBackdrop";
import { SdkComposerInput } from "./SdkComposerInput";
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
				<SdkComposerInput c={c} backdrop={backdrop} />
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
