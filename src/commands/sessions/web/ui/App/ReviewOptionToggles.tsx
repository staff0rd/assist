import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

export type ReviewOptions = {
	force: boolean;
	addressComments: boolean;
	announce: boolean;
};

export const reviewOptionDefaults: ReviewOptions = {
	force: false,
	addressComments: false,
	announce: false,
};

export function reviewOptionArgs(options: ReviewOptions): string[] {
	return [
		...(options.force ? ["--force"] : []),
		...(options.addressComments ? ["--address-comments"] : []),
		...(options.announce ? ["--announce"] : []),
	];
}

const labelSx = { "& .MuiFormControlLabel-label": { fontSize: 12 } } as const;

export function ReviewOptionToggles({
	value,
	onChange,
}: {
	value: ReviewOptions;
	onChange: (options: ReviewOptions) => void;
}) {
	return (
		<FormGroup sx={{ px: 2, py: 0.5 }}>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
						checked={value.force}
						onChange={(e) => onChange({ ...value, force: e.target.checked })}
					/>
				}
				label="Force re-run"
				sx={labelSx}
			/>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
						checked={value.addressComments}
						onChange={(e) =>
							onChange({ ...value, addressComments: e.target.checked })
						}
					/>
				}
				label="Address comments after"
				sx={labelSx}
			/>
			<FormControlLabel
				control={
					<Checkbox
						size="small"
						checked={value.announce}
						onChange={(e) => onChange({ ...value, announce: e.target.checked })}
					/>
				}
				label="Announce to Slack after"
				sx={labelSx}
			/>
		</FormGroup>
	);
}
