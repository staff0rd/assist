import type { Root } from "react-dom/client";
import { CriteriaOutlineHost } from "./CriteriaOutlineHost";
import { renderInShadow } from "./renderInShadow";

export function mountCriteriaOutline(
	host: HTMLElement,
	initialBody: string,
	onBody: (body: string) => void,
): Root {
	return renderInShadow(
		host,
		"assist-criteria",
		<CriteriaOutlineHost initialBody={initialBody} onBody={onBody} />,
	);
}
