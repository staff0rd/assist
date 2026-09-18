const USER_ATTACHMENT =
	/^https:\/\/github\.com\/user-attachments\/assets\/[A-Za-z0-9-]+$/;

export function isUserAttachmentUrl(url: string): boolean {
	return USER_ATTACHMENT.test(url);
}
