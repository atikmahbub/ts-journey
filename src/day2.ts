import { openai } from "./config/openai.js";
import { getCurrency, getTime, getWeather } from "./tools/utils.js";

//* DAY 2

export const main = async () => {
  const question =
    process.argv.slice(2).join(" ") ||
    "Explain the concept of interfaces in TypeScript.";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a TypeScript expert." },
      {
        role: "system",
        content: "Reply shortly with the key points. below than 100 words",
      },
      {
        role: "user",
        content: question,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "getWeather",
          description: "Get the current weather of a city",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string", description: "Name of the city" },
            },
            required: ["city"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getTime",
          description: "Get the current time of a city",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string", description: "Name of the city" },
            },
            required: ["city"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "getCurrency",
          description: "Get the currency of a country",
          parameters: {
            type: "object",
            properties: {
              country: { type: "string", description: "Name of the country" },
            },
            required: ["country"],
          },
        },
      },
    ],
  });

  const toolCall = response?.choices[0]?.message.tool_calls?.[0];

  if (!toolCall) {
    console.log(
      "🤖 Model replied directly:\n",
      response?.choices[0]?.message.content
    );
    return;
  }

  if (toolCall.type !== "function") {
    console.log("⚠️ Unsupported tool call type:", toolCall.type);
    return;
  }

  const { name: fnName, arguments: rawArguments } = toolCall.function;
  const args = JSON.parse(rawArguments) as Record<string, string>;
  console.log("🛠️ GPT called function:", fnName, "with args:", args);

  let result: string;
  if (fnName === "getWeather") result = getWeather(args.city!);
  else if (fnName === "getTime") result = getTime(args.city!);
  else if (fnName === "getCurrency") result = getCurrency(args.country!);
  else result = "Unknown function";

  console.log("📦 Function result:", result);

  // Follow Up request to get final answer

  const followUp = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Be concise and confident." },
      { role: "user", content: question },
      {
        role: "assistant",
        tool_calls: [toolCall],
      },
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      },
    ],
  });

  console.log("\n🤖 Final answer:\n", followUp.choices[0]?.message.content);
};

main().catch(console.error);
