import Stack from "@mui/material/Stack";
import type { RefObject } from "react";
import { SegmentedRadio } from "./SegmentedRadioGroup/SegmentedRadio";
import { segmentedRadioKeyHandler } from "./SegmentedRadioGroup/segmentedRadioKeyHandler";

const groupSx = {
	border: 1,
	borderColor: "divider",
	borderRadius: 1,
	height: 40,
	p: "2px",
	flexShrink: 0,
} as const;

export function SegmentedRadioGroup({
	label,
	options,
	value,
	onChange,
	optionLabel = (option) => option,
	groupRef,
	autoFocus,
	onTrack,
}: {
	label: string;
	options: readonly string[];
	value: string;
	onChange: (value: string) => void;
	optionLabel?: (option: string) => string;
	groupRef: RefObject<HTMLDivElement | null>;
	autoFocus: boolean;
	onTrack: () => void;
}) {
	return (
		<Stack
			ref={groupRef}
			direction="row"
			role="radiogroup"
			aria-label={label}
			spacing="2px"
			onFocus={onTrack}
			onKeyDown={segmentedRadioKeyHandler(options, value, onChange)}
			sx={groupSx}
		>
			{options.map((option) => (
				<SegmentedRadio
					key={option}
					value={option}
					label={optionLabel(option)}
					checked={option === value}
					autoFocus={autoFocus}
					onSelect={() => onChange(option)}
				/>
			))}
		</Stack>
	);
}
