import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { RunConfigInfo } from "./types";

type Param = NonNullable<RunConfigInfo["params"]>[number];

function paramLabel(p: Param): string {
	const suffix = p.description ? ` — ${p.description}` : "";
	return p.required ? `${p.name} *${suffix}` : `${p.name}${suffix}`;
}

export function RunParamInputs({
	config,
	values,
	onChange,
}: {
	config: RunConfigInfo;
	values: Record<string, string>;
	onChange: (v: Record<string, string>) => void;
}) {
	const params = config.params ?? [];

	const setParam = (name: string, value: string) =>
		onChange({ ...values, [name]: value });

	return (
		<Stack spacing={0.75}>
			{params.map((p) => (
				<TextField
					key={p.name}
					label={paramLabel(p)}
					value={values[p.name] ?? p.default ?? ""}
					onChange={(e) => setParam(p.name, e.target.value)}
					placeholder={p.default ?? ""}
					size="small"
					fullWidth
					slotProps={{
						input: { sx: { fontSize: 13 } },
						inputLabel: { sx: { fontSize: 11 }, shrink: true },
					}}
				/>
			))}
			<Button type="submit" variant="contained" size="small">
				Run {config.name}
			</Button>
		</Stack>
	);
}
