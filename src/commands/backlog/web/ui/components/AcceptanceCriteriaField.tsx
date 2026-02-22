import { Field } from "@base-ui/react/field";
import { useRef, useState } from "react";
import { CriterionRow } from "./CriterionRow";

type CriterionEntry = { id: number; value: string };

type AcceptanceCriteriaFieldProps = {
	initial: string[];
	onChange: (values: string[]) => void;
};

function toEntries(values: string[]): CriterionEntry[] {
	if (values.length === 0) return [{ id: 0, value: "" }];
	return values.map((v, i) => ({ id: i, value: v }));
}

export function AcceptanceCriteriaField({
	initial,
	onChange,
}: AcceptanceCriteriaFieldProps) {
	const nextId = useRef(initial.length);
	const [criteria, setCriteria] = useState<CriterionEntry[]>(() =>
		toEntries(initial),
	);

	function commit(entries: CriterionEntry[]) {
		setCriteria(entries);
		onChange(entries.map((e) => e.value));
	}

	function add() {
		nextId.current += 1;
		commit([...criteria, { id: nextId.current, value: "" }]);
	}

	function remove(id: number) {
		commit(criteria.filter((c) => c.id !== id));
	}

	function setValue(id: number, value: string) {
		commit(criteria.map((c) => (c.id === id ? { ...c, value } : c)));
	}

	return (
		<Field.Root className="mb-4">
			<Field.Label className="block font-medium mb-1 text-sm">
				Acceptance Criteria
			</Field.Label>
			<div className="flex flex-col gap-2">
				{criteria.map((c, i) => (
					<CriterionRow
						key={c.id}
						value={c.value}
						isFirst={i === 0}
						onChange={(v) => setValue(c.id, v)}
						onAdd={add}
						onRemove={() => remove(c.id)}
					/>
				))}
			</div>
		</Field.Root>
	);
}
