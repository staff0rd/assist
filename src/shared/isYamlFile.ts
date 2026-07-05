const YAML_EXTENSIONS = [".yml", ".yaml"];

export function isYamlFile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	return YAML_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}
