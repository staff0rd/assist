import type { useEditableBody } from "./useEditableBody";

export function criteriaPaneActions(edit: ReturnType<typeof useEditableBody>) {
	return {
		criteria: edit.criteria,
		onCriteriaChange: edit.writeCriteria,
		onCriteriaInsert: edit.insertCriteria,
		onCriteriaConvert: edit.convertCriteria,
	};
}
