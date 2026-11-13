import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { useForkRef } from "@mui/material/utils";
import { type KeyboardEvent, useState } from "react";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { SlashSuggestionPopper } from "./SlashSuggestionPopper";
import { useSlashSuggestions } from "./useSlashSuggestions";

type Props = Omit<TextFieldProps, "value" | "onChange" | "onKeyDown"> & {
	commands: SlashCommand[];
	value: string;
	onChange: (value: string) => void;
	onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
};

export function SlashTextField({
	commands,
	value,
	onChange,
	onKeyDown,
	onSelect,
	onFocus,
	inputRef,
	...rest
}: Props) {
	const slash = useSlashSuggestions(commands, value, onChange);
	const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
	const ref = useForkRef(slash.inputRef, inputRef);
	return (
		<>
			<TextField
				{...rest}
				ref={setAnchor}
				value={value}
				inputRef={ref}
				onChange={(e) => slash.edit(e.target)}
				onFocus={(e) => {
					slash.trackCursor(e.target as HTMLTextAreaElement);
					onFocus?.(e);
				}}
				onSelect={(e) => {
					slash.trackCursor(e.target as HTMLTextAreaElement);
					onSelect?.(e);
				}}
				onKeyDown={(e) => {
					// Stop Esc reaching the enclosing Dialog/Popover, which would close it.
					if (slash.onKeyDown(e)) e.stopPropagation();
					else onKeyDown?.(e);
				}}
			/>
			{slash.suggestions && (
				<SlashSuggestionPopper
					anchor={anchor}
					suggestions={slash.suggestions}
					onPick={slash.pick}
				/>
			)}
		</>
	);
}
