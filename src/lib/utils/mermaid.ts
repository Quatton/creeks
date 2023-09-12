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
