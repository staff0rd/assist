import { useState } from "react";
import {
	moveConfigListItem,
	removeConfigListItem,
	replaceConfigListItem,
} from "../../moveConfigListItem";

export function useConfigObjectList(
	items: unknown[],
	onChange: (value: unknown) => void,
) {
	const [open, setOpen] = useState<number | undefined>(undefined);

	function reorder(next: unknown[]) {
		setOpen(undefined);
		onChange(next);
	}

	return {
		isOpen: (index: number) => open === index,
		toggle: (index: number) => setOpen(open === index ? undefined : index),
		replace: (index: number, value: unknown) =>
			onChange(replaceConfigListItem(items, index, value)),
		moveUp: (index: number) =>
			reorder(moveConfigListItem(items, index, index - 1)),
		moveDown: (index: number) =>
			reorder(moveConfigListItem(items, index, index + 1)),
		remove: (index: number) => reorder(removeConfigListItem(items, index)),
		add: () => {
			setOpen(items.length);
			onChange([...items, {}]);
		},
	};
}
