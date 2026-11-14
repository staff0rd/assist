import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import type { RuleScope } from "../../../../../rules/types";

type Props = {
	value: string;
	scopes: RuleScope[];
	onChange: (scopeId: string) => void;
};

export function RuleScopeSelect({ value, scopes, onChange }: Props) {
	return (
		<TextField
			select
			label="Scope"
			size="small"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			sx={{
				maxWidth: "100%",
				justifySelf: "start",
				minWidth: (t) => t.spacing(30),
			}}
		>
			{scopes
				.filter((option) => !option.error)
				.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						{option.name}
					</MenuItem>
				))}
		</TextField>
	);
}
