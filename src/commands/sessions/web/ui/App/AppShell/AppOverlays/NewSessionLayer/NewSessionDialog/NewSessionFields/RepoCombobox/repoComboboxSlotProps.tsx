export function repoComboboxSlotProps(open: boolean) {
	return {
		htmlInput: {
			role: "combobox",
			"aria-label": "Repo",
			"aria-expanded": open,
		},
		input: {
			sx: { fontSize: 13, height: 40 },
		},
	};
}
