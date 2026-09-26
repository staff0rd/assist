import type { KeyboardEvent } from "react";
import { handleEnterSubmit } from "../../../../../../handleEnterSubmit";

export function comboboxKeyHandler<T>({
	open,
	highlighted,
	accept,
	close,
	navigate,
	openList,
}: {
	open: boolean;
	highlighted: T | undefined;
	accept: (item: T) => void;
	close: () => void;
	navigate: (e: KeyboardEvent) => void;
	openList: () => void;
}) {
	return (e: KeyboardEvent<HTMLDivElement>) => {
		if (!open) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				openList();
				return;
			}
			handleEnterSubmit(e);
			return;
		}
		if (e.key === "Escape") return;
		if (e.key !== "Tab") {
			navigate(e);
			return;
		}
		if (highlighted !== undefined) accept(highlighted);
		close();
	};
}
