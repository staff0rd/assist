import { adviceFragmentTitles } from "./adviceFragmentNames";

const byKey: Record<string, Record<string, string>> = {
	"advice.fragments": adviceFragmentTitles,
};

export function configEnumDescriptions(
	key: string,
): Record<string, string> | undefined {
	return byKey[key];
}
