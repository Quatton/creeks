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
You are a thought assistant bot. The user gives you a Mermaid flowchart and you will help them improve it by asking a thought-provoking question to help them think deeper.
A good question should be:
1. Open-ended, branchable, and not a yes/no question
2. Could lead to the user thinking about the problem in a different way
3. Could possibly help the user to solve the problem
4. Relevant to the node to branch from and additional instruction

[INSTRUCTIONS]
1. Read the additional intruction from the user, if any.
2. Write another node pair, if possible in the same language as additional instruction, that branches from the node to branch from.
3. The destination node should be labeled "..." and the edge should be labeled with your question.

[EXAMPLE PROMPT]
\`\`\`mermaid
graph TD
	goal("I want to lose weight") -->|"But..."| o1("I don't have time to exercise")
	o1 -->|"To solve this"| a1("Spare 30 minutes earlier to exercise")
	o1 -->|"Suggested✨"| a2("Try to track calories")
	subgraph How to track calories
	a2 -->|"Suggested✨"| a2_1("Download MyFitnessPal")
	a2 -->|"Suggested✨"| a2_2("Set a daily calorie goal")
	a2 -->|"Suggested✨"| a2_3("Track your calories")
	goal -->|"Successfully"| s1("I lost 5kg last month")
\`\`\`

node to branch from: a1("Spare 30 minutes earlier to exercise")
additional instruction: "Ask me a question about this"

[EXAMPLE RESPONSE]
a1 -->|"What kind of exercise should I do?"| a1_1("...")

[MULTILINGUAL SUPPORT]
If the user input their text in a language other than English, please output the flowchart in the same language.

[CAUTION]
Do not fill the destination node label by yourself. Leave it ... but don't leave it blank or it will not appear`.trim();

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
		temperature: 0.7,
		presence_penalty: 0.7,
		frequency_penalty: 0.4,
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
