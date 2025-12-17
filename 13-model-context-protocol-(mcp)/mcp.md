# Model Context Protocol (MCP)

The **MCP** is an open protocol that standardizes how applications provide tools and context to LLMs.

There are 3 types of MCP servers this SDK supports:

1. **Hosted MCP server tools** - remote MCP servers used as tools by the OpenAI Responses API

- (call publicly accessible remote servers with default OpenAI responses models)

2. **Streamable HTTP MCP servers** - local or remote servers that implement that Streamable HTTP transport

- (Highly Recommanded)

3. **Stdio MCP servers** - servers accessed via standard input/output (the simplest options)

- (work with local MCP servers that only support that standard-I/O protocol)
