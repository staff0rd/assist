import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
} from "@mui/material";

export function TypeField({
	value,
	onChange,
}: {
	value: "story" | "bug";
	onChange: (v: "story" | "bug") => void;
}) {
	return (
		<FormControl sx={{ mb: 2 }}>
			<FormLabel>Type</FormLabel>
			<RadioGroup
				row
				name="type"
				value={value}
				onChange={(e) => onChange(e.target.value as "story" | "bug")}
			>
				{(["story", "bug"] as const).map((t) => (
					<FormControlLabel
						key={t}
						value={t}
						control={<Radio size="small" />}
						label={t.charAt(0).toUpperCase() + t.slice(1)}
					/>
				))}
			</RadioGroup>
		</FormControl>
	);
}
