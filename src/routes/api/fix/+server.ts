import { OPENAI_API_KEY } from "$env/static/private";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAIApi, Configuration } from "openai-edge";

// IMPORTANT! Set the runtime to edge
export const config = {
	runtime: "edge"
};

const openaiConfig = new Configuration({
	apiKey: OPENAI_API_KEY
});

const openai = new OpenAIApi(openaiConfig);

const SYSTEM_PROMPT = `[CONTEXT]
You are a thought assistant bot. The user is trying to write a Mermaid flowchart, but an error occurs.
This is due to one or more of the following reasons:
1. You made an error during initial generation.
2. The user tried to combine two or more flowcharts together without proper tidying up.

[INSTRUCTIONS]
1. Combine all recklessly concatenated flowcharts into one.
2. Fix any errors in the flowchart.
3. Go back to the original markdown content and make sure that it includes all the necessary information.

[MULTILINGUAL SUPPORT]
If the user input their text in a language other than English, please output the flowchart in the same language.
Except for the subgraph name. For the subgraph name, please output it in English.
For example, subgraph ภาษาไทย is disallowed

[CAUTION]
The flowchart might contain hard-to-fix errors or weird behavior such as duplicated subgraph. You should remove stuff you are not sure about.
You should escape ", (, and ) with backslash or else it will break the Mermaid
Your response should start with graph TD or it will break. If you want to use subgraph, use graph TD first and then switch to subgraph with direction LR.
Make sure you end it.
`.trim();

const USER_PROMPT = (prompt: string) =>
	`${prompt ? prompt : "(no prompt please return only empty string)"}
`.trim();

export async function POST({ request }) {
	const { prompt } = await request.json();

	const response = await openai.createChatCompletion({
		messages: [
			{
				role: "system",
				content: SYSTEM_PROMPT
			},
			{
				role: "user",
				content: USER_PROMPT(prompt)
			}
		],
		temperature: 0.2,
		model: "gpt-4",
		stream: true
	});

	// Check for errors
	if (!response.ok) {
		return new Response(await response.text(), {
			status: response.status
		});
	}

	// Extract the text response from the Cohere stream
	const stream = OpenAIStream(response);
	// Respond with the stream
	return new StreamingTextResponse(stream);
}
