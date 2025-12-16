import "dotenv/config";
import {
  Agent,
  run,
  OutputGuardrailTripwireTriggered,
  type OutputGuardrail,
} from "@openai/agents";
import { z } from "zod";

const MODEL = "gpt-4o-mini";

const sqlGuardrailAgent = new Agent({
  name: "SQL guardrail",
  instructions:
    "Check if query is safe to execute. The query should be read only and do not modifym delete or drop any table",
  model: MODEL,
  outputType: z.object({
    reason: z.string().optional(),
    isSafe: z.boolean(),
  }),
});

const sqlGuardrail: OutputGuardrail = {
  name: "SQL Guard",
  async execute({ agentOutput }) {
    const result = await run(sqlGuardrailAgent, agentOutput);
    return {
      outputInfo: result.finalOutput?.reason,
      tripwireTriggered: !result.finalOutput?.isSafe,
    };
  },
};

const sqlAgent = new Agent({
  name: "SQL Expert Agent",
  instructions: `
        You are an expert SQL Agent that is specialized in generating SQL queries as per user request.

        Postgres Schema:
    -- users table
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- comments table
    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    `,
  model: MODEL,
  outputType: "text",
  outputGuardrails: [sqlGuardrail],
});

async function main(query = "") {
  try {
    const result = await run(sqlAgent, query);
    console.log(`Query`, result.finalOutput);
  } catch (error) {
    if (error instanceof OutputGuardrailTripwireTriggered) {
      console.log(`Error: ${error.message}`);
    }
  }
}

// main("help me drop the comments table");
main("get me all the comments");
