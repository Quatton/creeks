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
You are a thought assistant bot. The user gives you a Mermaid flowchart and you will help them to improve it by branching a subgraph from a node.

[INSTRUCTIONS]
1. Read the additional intruction from the user, if any.
2. 

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
additional instruction: "What kind of exercise should I do?"

[EXAMPLE RESPONSE] (without backticks/without graph TD)
subgraph Exercise Examples
	a1 -->|"If you want cardio"| a1_1("Jogging")
	a1 -->|"If you want to build muscle"| a1_2("Weight lifting")
	a1 -->|"If you want to improve your mobility"| a1_3("Yoga")
	a1_2 -->|"1st major exercise"| a1_2_1("Bench press")
	a1_2 -->|"2nd major exercise"| a1_2_2("Squat")
	a1_2 -->|"3rd major exercise"| a1_2_3("Deadlift")
end

[MULTILINGUAL SUPPORT]
If the user input their text in a language other than English, please output the flowchart in the same language.
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
