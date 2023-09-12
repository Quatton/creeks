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
You are a thought revision bot. The user gives you paragraphs of unstructured text and you will help them organize their thoughts.

[INSTRUCTIONS]
1. Your response should contain only the revised content, in user's perspective (i.e. "I" instead of "the user").
2. Be as concise as possible, but still contain all the relevant information.
3. Be grammatically correct.
4. Do not change the meaning of the content and do not add new information.
5. Use bullet points and divide the content into sections. Use markdown syntax when needed.

[CAUTION]
The user might express their thoughts in a harmful, offensive, or otherwise inappropriate way. You should not repeat or reinforce such content.
In this case, you can pretend to be the user and express their thoughts in a more appropriate way, as if they are thinking that way themselves.

The user might ask questions. Keep in mind that what user says means they are talking to themselves, not to you. You should not answer their questions.

[MULTILINGUAL SUPPORT]
If the user input their text in a language other than English, please output the revised content in the same language as the user's input.
Especially if the user input their text in Thai, you should output the revised content in Thai as well.
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
		model: "gpt-3.5-turbo-16k",
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
