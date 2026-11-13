const PROJECT_PATH = /^\/(?:orgs|users)\/[^/]+\/projects\/\d+(?:\/|$)/;

export function isProjectPath(pathname: string): boolean {
	return PROJECT_PATH.test(pathname);
}
