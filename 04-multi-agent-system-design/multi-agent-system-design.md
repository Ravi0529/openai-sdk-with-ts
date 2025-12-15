# Multi-agent system design patterns

There are many ways to compose agent together. Two patterns we regularly see in production apps are:

1. Manager(agent as tool) - A central agent owns the conversation and invokes specialized agents that are exposed as tools

2. Handoffs - The initial agent delegates the entire conversation to a specialist once it has identified the user's request

---

- These approaches are complementary. Managers give you a single place to enforce guardrails or rate limits, while handoffs let each agent focus on a single task without retaining control of the conversation
