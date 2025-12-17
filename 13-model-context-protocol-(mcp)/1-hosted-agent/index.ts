import "dotenv/config";
import { Agent, run, hostedMcpTool } from "@openai/agents";

const agent = new Agent({
  name: "MCP Assistant",
  instructions: "You must always use the MCP tools to answer questions.",
  model: "gpt-4o-mini",
  tools: [
    hostedMcpTool({
      serverLabel: "gitmcp",
      serverUrl: "https://gitmcp.io/openai/codex",
    }),
  ],
});

async function main(query: string) {
  const result = await run(agent, query);
  console.log(result.finalOutput);
}

main("What is this repo about?");
