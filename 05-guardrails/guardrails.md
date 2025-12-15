# Guardrails

Guardrails can run alongside your agents or block execution until they complete, allowing you to perform checks and validations on user input or agent output. For example, you may run a lightweight model as a guardrail before invoking an expensive model. If the guardrail detects malicious usage, it can trigger an error and stop the costly model from running

There are 2 kinds of guardrails:

1. **Input guardrails** run on the initial user input

2. **Output guardrails** run on the final agent output
