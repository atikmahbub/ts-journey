import { openai } from "./config/openai.js";

const question = process.argv.slice(2).join(" ") || "What is TypeScript?";

async function main() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI tutor for TypeScript developers.",
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  if (response.choices.length === 0) {
    throw new Error("No response from OpenAI API");
  }
  const content =
    response.choices[0]?.message?.content ?? "No content returned.";
  console.log("\n🤖 Response:\n", content);
}

main().catch(console.error);
