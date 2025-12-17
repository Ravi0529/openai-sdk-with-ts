// View conversations --> https://platform.openai.com/logs?api=conversations

import "dotenv/config";
import { Agent, run } from "@openai/agents";
import OpenAI from "openai";

const agent = new Agent({
  name: "Assistant",
  instructions: "Reply very concisely",
  model: "gpt-4o-mini",
});

const main = async () => {
  const client = new OpenAI();
  // now you can create a coversation using Coversations API and then reuse its ID for every turn
  // convId = conv_6942aeadcde881909d9da66f968f9fb1086b6f4dac37a4c9
  const { id: conversationId } = await client.conversations.create({});

  const first = await run(agent, "What city is the Golden Gate Bridge in?", {
    conversationId,
  });
  console.log(first.finalOutput); // responseId = resp_086b6f4dac37a4c9006942aeaf98ac8190bda07761c7694f24

  const second = await run(agent, "What state is it in?", {
    conversationId,
  });
  console.log(second.finalOutput); // responseId = resp_086b6f4dac37a4c9006942aeb1281c81909da20da2b40711d6
};

main();
