import { attachmentMimeTypes } from "./attachmentMimeTypes";

export const ghAttachableExtensions = new Set([
	...Object.values(attachmentMimeTypes),
	"jpeg",
]);
