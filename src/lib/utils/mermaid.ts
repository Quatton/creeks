import mermaid from "mermaid";
import type { MermaidConfig, RenderResult } from "mermaid";

export const mermaidRender = async (
	config: MermaidConfig,
	code: string,
	id: string
): Promise<RenderResult> => {
	// Should be able to call this multiple times without any issues.
	mermaid.initialize(config);
	return await mermaid.render(id, code);
};

export const mermaidParse = async (code: string): Promise<boolean> => {
	return (
		(await mermaid.parse(code, {
			suppressErrors: true
		})) ?? false
	);
};

export const updateMermaidNode = (
	code: string,
	update: {
		id: string;
		label: string;
	}
) => {
	// it's in the form of
	// nodeId("label")
	// 1. we find that nodeId
	// 2. we replace the label
	// 3. profit
	const nodeId = update.id;
	const label = update.label;
	const regex = new RegExp(`${nodeId}\\(".*"\\)`);
	const newCode = code.replace(regex, `${nodeId}("${label}")`);
	return newCode;
};
