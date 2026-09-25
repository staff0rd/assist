import { useState } from "react";
import { convertAcceptanceCriteria } from "../../../../../convertAcceptanceCriteria";
import { insertAcceptanceCriteria } from "../../../../../insertAcceptanceCriteria";
import type { AcceptanceCriterion } from "../../../../../splitAcceptanceCriteria";
import { useAcceptanceCriteria } from "./useEditableBody/useAcceptanceCriteria";
import { wrapCollapsed } from "./useEditableBody/wrapCollapsed";
import { writeAcceptanceCriteria } from "../../../../../writeAcceptanceCriteria";

export function useEditableBody(initialBody: string, editable: boolean) {
	const [body, setBody] = useState(initialBody);
	const criteria = useAcceptanceCriteria(body, editable);

	return {
		body,
		criteria,
		collapse: (quote: string) =>
			setBody((current) => wrapCollapsed(current, quote)),
		writeCriteria: (items: AcceptanceCriterion[]) =>
			setBody((current) => writeAcceptanceCriteria(current, items)),
		insertCriteria: () => setBody(insertAcceptanceCriteria),
		convertCriteria: () => setBody(convertAcceptanceCriteria),
		editedBody: () => (editable ? body : undefined),
	};
}
