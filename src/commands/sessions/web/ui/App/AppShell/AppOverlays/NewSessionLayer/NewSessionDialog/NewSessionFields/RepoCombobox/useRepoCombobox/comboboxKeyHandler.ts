import type { KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { handleEnterSubmit } from "../../../../../../../handleEnterSubmit";

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
		if (e.key === "Enter") {
			e.preventDefault();
			if (highlighted === undefined) return;
			// Commit the accepted repo before submitting so the form's submit handler sees the new cwd.
			flushSync(() => {
				accept(highlighted);
				close();
			});
			handleEnterSubmit(e);
			return;
		}
		if (e.key !== "Tab") {
			navigate(e);
			return;
		}
		if (highlighted !== undefined) accept(highlighted);
		close();
	};
}
