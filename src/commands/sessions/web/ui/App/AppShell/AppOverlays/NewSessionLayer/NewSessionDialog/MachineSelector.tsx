import { useRef } from "react";
import type { NodeClone } from "../../../../../useNodeClones";
import { useNodeSelectionContext } from "../../../../../useNodeSelectionContext";
import { MachineOptionLabel } from "./MachineSelector/MachineOptionLabel";
import { SegmentedRadioGroup } from "./SegmentedRadioGroup";

export function MachineSelector({
	value,
	onChange,
	cloneState,
}: {
	value: string | undefined;
	onChange: (node: string) => void;
	cloneState: (node: string | undefined) => NodeClone;
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
			optionLabel={(name) => (
				<MachineOptionLabel
					nodes={nodes}
					name={name}
					clone={cloneState(name)}
				/>
			)}
			groupRef={groupRef}
			autoFocus={false}
			onTrack={() => {}}
		/>
	);
}
