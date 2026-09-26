import { useState } from "react";

export function useComboboxOpen() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	return {
		open,
		query,
		show: () => setOpen(true),
		filterBy: (next: string) => {
			setQuery(next);
			setOpen(true);
		},
		close: () => {
			setOpen(false);
			setQuery("");
		},
	};
}
