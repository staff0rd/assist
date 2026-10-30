import { PhoneRepoPicker } from "./PhoneRepoPicker";
import { PhoneSheetNavHeader } from "./PhoneSheetNavHeader";
import type { PhoneNewSession } from "./usePhoneNewSession";

export function PhoneRepoPickerView({
	form,
	onBack,
}: {
	form: PhoneNewSession;
	onBack: () => void;
}) {
	return (
		<>
			<PhoneSheetNavHeader title="Repo" backLabel="Back" onBack={onBack} />
			<PhoneRepoPicker
				repos={form.repos}
				value={form.cwd}
				onPick={(cwd) => {
					form.setCwd(cwd);
					onBack();
				}}
			/>
		</>
	);
}
