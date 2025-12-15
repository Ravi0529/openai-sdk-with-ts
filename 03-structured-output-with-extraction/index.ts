import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

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

// Why extraction?
// Sometimes we need to store the specific information from the output provided by the Agent in DB
// So after specifying the city, degree_c and condition, we can access them individually after finalOutput
const getWeatherResultSchema = z.object({
  city: z.string().describe("Name of the city"),
  degree_c: z.number().describe("The degree celcius of the temp"),
  condition: z.string().optional().describe("Condition of the weather"),
});

const agent = new Agent({
  name: "Weather Agent",
  instructions: `You are a expert weather agent that helps user tell weather report`,
  model: "gpt-4o-mini",
  tools: [getWeatherTool],
  outputType: getWeatherResultSchema,
});

const main = async (query = "") => {
  const result = await run(agent, query);
  console.log("Result: ", result.finalOutput); // Result:  { city: 'Surat', degree_c: 22, condition: 'Clear' }
  // console.log("City: ", result.finalOutput?.city);
  // console.log("Degree: ", result.finalOutput?.degree_c);
  // console.log("Condition: ", result.finalOutput?.condition);
};

main("What is weather of Surat?");
