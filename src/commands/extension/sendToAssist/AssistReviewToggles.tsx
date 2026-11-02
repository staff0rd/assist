import { Checkbox, ListItemIcon, MenuItem } from "@mui/material";
import {
	type ReviewOptions,
	reviewOptionFlags,
} from "../../../shared/reviewOptionFlags";

export function AssistReviewToggles({
	value,
	onChange,
}: {
	value: ReviewOptions;
	onChange: (options: ReviewOptions) => void;
}) {
	return reviewOptionFlags.map(({ key, label }) => (
		<MenuItem
			key={key}
			role="menuitemcheckbox"
			aria-checked={value[key]}
			onClick={() => onChange({ ...value, [key]: !value[key] })}
		>
			<ListItemIcon>
				<Checkbox
					size="small"
					checked={value[key]}
					tabIndex={-1}
					disableRipple
					sx={{ p: 0 }}
				/>
			</ListItemIcon>
			{label}
		</MenuItem>
	));
}
