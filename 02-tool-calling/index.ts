import "dotenv/config";
import { Agent, run, tool, webSearchTool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

// There are already many Hosted tools by OpenAI, you can add the following built-in tools:
// webSearchTool()
// fileSearchTool() --> (query vector stores hosted on OpenAI)
// computerTool() --> (automate GUI interactions)
// shellTool() --> (run shell commands on the host)
// applyPatchTool() --> (apply V4 diffs to local files)
// codeInterpreterTool() --> (run code in a sandboxed environment)
// imageGenerationTool() --> (generate images based on text)

// tool formation
const getWeatherTool = tool({
  name: "get_weather",
  description: "Returns the current weather information for the given city",
  parameters: z.object({
    city: z.string().describe("Name of the city"),
  }),
  async execute({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The weather of ${city} is ${response.data}`;
  },
});

const agent = new Agent({
  name: "Weather Agent",
  instructions: `You are a expert weather agent that helps user tell weather report`,

  // tool calling
  tools: [getWeatherTool],
  // tools: [webSearchTool()],
});

const main = async (query = "") => {
  const result = await run(agent, query);
  console.log("Result: ", result.finalOutput);
};

// The agent is smart enough that it will call the tool 3 times and then answer the query
// main("What is weather of Surat, Delhi and Rajkot?");
main("What is weather of Surat?");

// --------------------------------------------------------------------

// Agent as tools
// Sometimes you want an Agent to assist another agent without fully handing off the conversation

const summerizer = new Agent({
  name: "Summerizer",
  instructions: "Generate a concise summary of the supplied text",
});

const summerizerTool = summerizer.asTool({
  toolName: "summerize_text",
  toolDescription: "Generate a concise summary of the supplied text",
});

const mainAgent = new Agent({
  name: "Research assistant",
  tools: [summerizerTool],
});

const callingfunc = async (query = "") => {
  const result = await run(mainAgent, query);
  console.log("Result: ", result.finalOutput);
};

callingfunc(
  "The sun dipped below the horizon, painting the sky in vibrant hues of orange and purple. A gentle breeze rustled through the trees, bringing the soft scent of jasmine and the distant sound of evening prayers. It was a perfect, peaceful moment to end the long day.",
);
