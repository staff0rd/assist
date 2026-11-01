import { phoneCaptureFlag } from "./phoneCaptureFlag";

export function hasPhoneCaptureFlag(
	storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage,
): boolean {
	try {
		return storage?.getItem(phoneCaptureFlag) === "1";
	} catch {
		return false;
	}
}
