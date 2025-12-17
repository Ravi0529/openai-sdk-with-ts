// Context is an overloaded term. There are two main classes of context you might care about:
// 1. **Local context** that your code can access during a run: dependencies or data needed by tools, callbacks like onHandoff, and lifecycle hooks
// 2. **Agent/LLM context** that the language model can see when generating a response

// --------------------------------------------------------------------
import "dotenv/config";
import { Agent, run, tool, RunContext } from "@openai/agents";
import { z } from "zod";

// method 1 and 2
// interface MyContext {
//   userId: string;
//   userName: string;
// }

// method 3
interface MyContext {
  userId: string;
  userName: string;

  fetchUserInfoFromDb: () => Promise<string>;
}

// method 2 --> runtime context management
// const getUserInfoTool = tool({
//   name: "get_user_info_tool",
//   description: "Gets the user info",
//   parameters: z.object({}),
//   async execute(_, ctx?: RunContext<MyContext>): Promise<string | undefined> {
//     return `UserId=${ctx?.context.userId}\nUserName=${ctx?.context.userName}`;
//   },
// });

// method 3 --> runtime context management
const getUserInfoTool = tool({
  name: "get_user_info_tool",
  description: "Gets the user info",
  parameters: z.object({}),
  async execute(_, ctx?: RunContext<MyContext>): Promise<string | undefined> {
    return await ctx?.context.fetchUserInfoFromDb();
  },
});

// method 1
// const customerSuppportAgent = new Agent<MyContext>({
//   name: "Customer Support Agent",
//   instructions: ({ context }) => {
//     return `You are an export customer support agent\nContext: ${JSON.stringify(context)}`;
//   },
//   model: "gpt-4o-mini",
// });

const customerSuppportAgent = new Agent<MyContext>({
  name: "Customer Support Agent",
  instructions: "You are an export customer support agent",
  model: "gpt-4o-mini",
  // method 2
  tools: [getUserInfoTool],
});

const main = async (query: string = "", ctx: MyContext) => {
  const result = await run(customerSuppportAgent, query, {
    context: ctx,
  });
  console.log(result.finalOutput);
};

// local context management
main("What is my name?", {
  userId: "1",
  userName: "Jhon Doe",

  // method 3
  fetchUserInfoFromDb: async () => `UserId=1,UserName="Jhon`,
});
