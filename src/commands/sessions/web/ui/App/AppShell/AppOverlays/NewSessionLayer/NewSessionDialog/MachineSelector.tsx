import { useRef } from "react";
import { useNodeSelectionContext } from "../../../../../useNodeSelectionContext";
import { NodeOptionLabel } from "../../../../NodeOptionLabel";
import { SegmentedRadioGroup } from "./SegmentedRadioGroup";

export function MachineSelector({
	value,
	onChange,
}: {
	value: string | undefined;
	onChange: (node: string) => void;
}) {
	const { nodes, names, visible } = useNodeSelectionContext();
	const groupRef = useRef<HTMLDivElement>(null);
	if (!visible || !nodes || !value) return null;

	return (
		<SegmentedRadioGroup
			label="Machine"
			options={names}
			value={value}
			onChange={onChange}
			optionLabel={(name) => <NodeOptionLabel nodes={nodes} name={name} />}
			groupRef={groupRef}
			autoFocus={false}
			onTrack={() => {}}
		/>
	);
}
