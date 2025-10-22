import { openai } from "./config/openai.js";
import { getWeather, getCurrency } from "./tools/utils.js";

async function main() {
  const question =
    process.argv.splice(2).join(" ") ||
    "Whats is the weather in bogra and what is currency in bangladesh";
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an AI planner that decides which tools to use and in what order.",
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
          description: "Get the weather by a provided city",
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
          description: "Get the currency by a provided country",
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

  const toolCalls = response?.choices[0]?.message?.tool_calls ?? [];

  if (toolCalls.length === 0) {
    console.log(
      "🤖 Model replied directly:\n",
      response?.choices[0]?.message.content
    );
    return;
  }

  const results: string[] = [];

  for (const call of toolCalls) {
    if (call.type !== "function") {
      results.push(`Unsupported tool call type: ${call.type}`);
      continue;
    }

    const { name: fnName, arguments: rawArguments } = call.function;
    const args = JSON.parse(rawArguments ?? "{}") as Record<string, unknown>;
    console.log("🛠️ GPT called function:", fnName, "with args:", args);

    let output = "";
    if (fnName === "getWeather") {
      const city = typeof args.city === "string" ? args.city : undefined;
      output = city ? getWeather(city) : "Missing city argument.";
    } else if (fnName === "getCurrency") {
      const country =
        typeof args.country === "string" ? args.country : undefined;
      output = country ? getCurrency(country) : "Missing country argument.";
    } else {
      output = `Unknown function: ${fnName}`;
    }

    results.push(`${fnName}: ${output}`);
  }

  const summary = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a summarizer. Combine tool results into a natural answer.",
      },
      { role: "user", content: question },
      { role: "assistant", content: JSON.stringify(results) },
    ],
  });

  console.log("\n🤖 Final Answer:\n", summary?.choices[0]?.message.content);
}

main().catch(console.error);
