---
title: "AIA Advanced Tool Integration"
categories:
  - Engineering
tags:
  - AIA
  - Ruby
  - Prompt Engineering
  - MCP
  - CLI
  - Tools
---

**From Dynamic Prompts to Advanced Tool Integration**

The AI Assistant (AIA) is a command-line interface (CLI) written in Ruby and distributed as a Ruby gem (`gem install aia`). AIA leverages the `ruby_llm` gem as its API library for accessing Large Language Model (LLM) provider services, enabling seamless integration with various AI models. Additionally, It also uses the `ruby_llm-mcp` gem to extend its capabilities by providing a way to use Model Context Protocol (MCP) clients to access the capabilities of MCP servers.

AIA can utilize the `shared_tools` Ruby gem, which provides a collection of pre-built tools for common tasks like file operations, web requests, and system interactions. This article, the fifth in our comprehensive series, explores AIA's powerful tool integration system that transforms it from a text processor into a capable AI agent that can interact with systems, APIs, and external services through structured function calls.

## Series Articles

1. [The Philosophy of Prompt-Driven Development with AIA](https://madbomber.github.io/blog/engineering/AIA-Philosophy/)
2. [Mastering AIA's Batch Mode: From Simple Questions to Complex Workflows](https://madbomber.github.io/blog/engineering/AIA-Batch-Mode/)
3. [Building AI Workflows: AIA's Prompt Sequencing and Pipelines](https://madbomber.github.io/blog/engineering/AIA-Workflows/)
4. [Interactive AI Sessions: Mastering AIA's Chat Mode](https://madbomber.github.io/blog/engineering/AIA-Chat-Mode/)
5. [From Dynamic Prompts to Advanced Tool Integration](https://madbomber.github.io/blog/engineering/AIA-Advanced-Tool-Integration/)

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [Foundation: Dynamic Content with ERB and Shell Integration](#foundation-dynamic-content-with-erb-and-shell-integration)
    - [Embedded Ruby (ERB) Processing](#embedded-ruby-erb-processing)
    - [Shell Integration](#shell-integration)
  - [Advanced Capabilities: External Tools as Callback Functions](#advanced-capabilities-external-tools-as-callback-functions)
    - [The Role of External Tools in AIA](#the-role-of-external-tools-in-aia)
    - [Utilizing the shared_tools Ruby Gem](#utilizing-the-shared_tools-ruby-gem)
    - [Custom Tool Development](#custom-tool-development)
  - [Next-Generation Integration: Model Context Protocol (MCP)](#next-generation-integration-model-context-protocol-mcp)
    - [MCP Server Integration](#mcp-server-integration)
      - [Accessing Local MCP Client Definitions](#accessing-local-mcp-client-definitions)
        - [Example MCP Client Definition](#example-mcp-client-definition)
      - [Accessing Remote MCP Client Definitions](#accessing-remote-mcp-client-definitions)
    - [Dynamic Capability Discovery](#dynamic-capability-discovery)
  - [Contributing to the Ecosystem](#contributing-to-the-ecosystem)
  - [Using Support Tools and Utilities on the Command Line](#using-support-tools-and-utilities-on-the-command-line)
    - [direnv](#direnv)
      - [Use Cases with AIA](#use-cases-with-aia)
    - [jq](#jq)
      - [Use Cases with AIA](#use-cases-with-aia-1)
  - [Next Steps](#next-steps)

<!-- Tocer[finish]: Auto-generated, don't remove. -->

## Foundation: Dynamic Content with ERB and Shell Integration

Before exploring external tools, it is essential to understand AIA's foundational capabilities for creating dynamic prompt content. AIA provides two primary mechanisms for injecting dynamic content into prompts **before** the completed prompt text is sent to the LLM for processing. External tools, such as the callback functions provided by local tools (subclasses of `RubyLLM::Tool`) or those provided through the Model Context Protocol (MCP), are processed **during** the provider's handling of the LLM, which requires multiple round trips between the localhost and the provider's API gateway.

### Embedded Ruby (ERB) Processing

AIA supports full ERB (Embedded Ruby) processing within prompts, enabling sophisticated Ruby-based business logic. This allows you to:

- **Conditional Content**: Include or exclude prompt sections based on runtime conditions.
- **Dynamic Data Generation**: Calculate values, format data, or generate content programmatically.
- **Library Integration**: Use any Ruby gem by requiring it within your prompt logic.
- **Complex Business Logic**: Implement sophisticated decision trees and data processing.

Example ERB usage in prompts:
```erb
<% require 'date' %>
Current timestamp: <%= Time.now.strftime('%Y-%m-%d %H:%M:%S') %>

<% if ENV['DEBUG'] %>
Debug mode is enabled.
<% end %>

<% %w[file1.txt file2.txt].each do |file| %>
Processing file: <%= file %>
<% end %>
```

### Shell Integration

AIA's shell integration enables prompts to incorporate the value of any system environment variable or output from any shell command.

Using the shell integration, you can:
- **System Information**: Include current system status, file listings, or environment details.
- **External Program Output**: Incorporate results from any CLI tool or script.
- **Real-time Data**: Fetch current information from APIs, databases, or services.
- **File Processing**: Transform or analyze files before including content in prompts.

Example shell integration:
```
Current directory contents: $(ls -la)

System information: $(uname -a)

Git repository status: $(git status --porcelain)

Recent log entries:
$(tail -n 10 /var/log/application.log)
```

These foundational capabilities transform static prompts into dynamic, context-aware templates that adapt to the current system state and runtime conditions.

## Advanced Capabilities: External Tools as Callback Functions

Building on AIA's dynamic content foundation, external tools provide even more sophisticated capabilities through callback functions that enhance Large Language Model (LLM) processing. These tools enable AIA to actively interact with systems, APIs, and external services during prompt processing.

### The Role of External Tools in AIA

External tools extend AIA from a text processor into an active agent capable of:
- **API Integration**: Making HTTP requests and processing responses.
- **File Operations**: Advanced file reading, writing, and manipulation.
- **System Commands**: Executing complex shell operations with enhanced error handling.
- **Data Processing**: Analyzing, transforming, and formatting data structures.

Tools are defined as subclasses of `RubyLLM::Tool`, providing a standardized framework for creating specialized functionalities that can be invoked during LLM operations as callback functions.

### Utilizing the shared_tools Ruby Gem

The `shared_tools` gem provides a curated collection of pre-built tools covering common automation tasks:

- **File Operations**: Advanced file system interactions.
- **Web Utilities**: HTTP client capabilities and API integration.
- **System Commands**: Enhanced shell execution with safety features.
- **Data Processing**: Tools for analyzing and transforming various data formats.

To access shared_tools, use the `--require` flag:
```bash
aia --chat --require shared_tools/ruby_llm
```

View available tools using the `//tools` directive for descriptions and usage examples.

### Custom Tool Development

Beyond shared tools, developers can create specialized tools for unique workflows. Custom `RubyLLM::Tool` subclasses can be loaded using the `--tools` option:

```bash
aia --chat --tools $RR/my-custom-tools/
```

This approach enables domain-specific functionality tailored to particular use cases or organizational requirements.

## Next-Generation Integration: Model Context Protocol (MCP)

The Model Context Protocol (MCP) represents the cutting edge of AI tool integration. MCP provides a standardized way for AI applications to discover and interact with external tools, data sources, and services dynamically.

### MCP Server Integration

AIA uses the `ruby_llm-mcp` gem to provide clients that interact with MCP servers to make use of their published tools. While MCP servers can also provide resources and prompts, currently AIA is only using their tool capability to enhance the content of the AI prompt context during the prompt process by the LLMs.

MCP servers are available for diverse domains:
- **Version Control**: GitHub, GitLab integration.
- **Database Connectivity**: SQL and NoSQL database access.
- **File Systems**: Advanced file operations across different storage systems.
- **Cloud Services**: AWS, GCP, Azure service integration.
- **Development Tools**: IDE integration, testing frameworks, deployment systems.

#### Accessing Local MCP Client Definitions

Use the `--tools` CLI option to specify a path to a configuration file that defines the MCP clients to be used. You can use a comma-separated list of file paths, specify a directory, both, or use multiple `--tools` options to tell AIA where to find your local MCP client definitions.

```bash
aia --chat --tools path/to/mcp_client_config.rb
```

##### Example MCP Client Definition

Using the `RubyLLM::MCP.add_client` method you can define as many MCP clients in a Ruby file as makes sense to you; however, it is recommended to only defind one client per file for maximum flexibility.  Remember that AIA allows you to reference more that one MCP file on the command line or an entire directory of MCP/Tool definitions.

```ruby
require "ruby_llm/mcp"

RubyLLM::MCP.add_client(
  name: "github-mcp-server",
  transport_type: :stdio,
  config: {
    command: "/opt/homebrew/bin/github-mcp-server", # brew install github-mcp-server
    args: %w[stdio],
    env: { "GITHUB_PERSONAL_ACCESS_TOKEN" => ENV.fetch("GITHUB_PERSONAL_ACCESS_TOKEN") },
  },
)
```

#### Accessing Remote MCP Client Definitions

Use the `--require` CLI option to specify a gem such as `shared_tools` to have AIA load your MCP client definitions. You can load all of the MCP client definitions from the `shared_tools` gem like this:

```bash
aia --chat --require shared_tools/ruby_llm/mcp
```

Or load a specific MCP client definition from the `shared_tools` gem like this:

```bash
aia --chat --require shared_tools/ruby_llm/mcp/github_mcp_server
```

> **NOTE**: The `github_mcp_server` defined in `shared_tools` is for the localhost-based executable. For a macOS-based system, you should `brew install github-mcp-server` first before attempting to use it with AIA. Other OS platforms will have a different path where the executable is loaded. You may need to copy the definition from the `shared_tools` gem to your localhost and modify its definition.

### Dynamic Capability Discovery

Unlike static tool configuration, MCP enables runtime discovery of available capabilities. This means new tools and services can be added to your AIA environment without code modifications, creating a truly extensible AI platform.

## Contributing to the Ecosystem

The power of AIA's tool ecosystem grows through community contributions:

**shared_tools Contributions**: Share your MCP client definitions and your `RubyLLM::Tool` subclasses with the entire Ruby community. Visit the [shared_tools repository](https://github.com/madbomber/shared_tools) for contribution guidelines.

**MCP Server Development**: Create MCP servers for your domain expertise, making specialized capabilities available to the broader AI community.

## Using Support Tools and Utilities on the Command Line

AIA's layered approach to capability expansion—from ERB and shell integration through callback functions (also known as tools) to MCP integration—provides developers with unprecedented flexibility for building AI-powered applications. Starting with dynamic prompt content and scaling to sophisticated external integrations, AIA grows with your automation needs while maintaining simplicity and extensibility.

Since AIA operates as a first-class citizen on the command line and utilizes system environment variables for configuration, several support tools and utilities can enhance AIA's performance in your environment:

- **direnv**: (`brew install direnv`) Load/unload environment variables based on your directory.
- **jq**: (`brew install jq`) Lightweight and flexible command-line JSON processor.

I'm sure you can think of or have already used many other tools like `curl` or `wget` to bring content into AIA for processing through an LLM.

### direnv

`direnv` is an extension for your shell. It augments existing shells with a new feature that can load and unload environment variables depending on the current directory.

**Website**: [direnv.net](https://direnv.net/)
**License**: MIT

#### Use Cases with AIA

AIA uses system environment variables whose names are prefixed with the string `AIA_`. Using the `direnv` utility, you can create a `.envrc` file in your project's root directory that tailors the AIA configuration for the project.

Here's an example `.envrc` file:

```bash
# Set repository root for convenient path references
export RR=`pwd`

# Project-specific AIA configuration
export AIA_CONFIG_FILE="$RR/config/aia_config.yml"
export AIA_MODEL="gpt-4.1-nano"
export AIA_OUT_FILE="aia_output.md"
export AIA_LOG_FILE="$RR/logs/aia_debug.log"

# Additional project-specific variables
export AIA_PROMPTS_DIR="$RR/prompts"
export AIA_TOOLS_DIR="$RR/tools"
```

The `$RR` environment variable represents the repository root directory, providing a convenient way to reference project files with absolute paths regardless of your current working directory within the project. This approach ensures that AIA configurations remain consistent whether you're working from the project root or any subdirectory. A nice little alias to have is `alias rr='cd $RR'` as a return-to-root command.

Common use cases include:
- **AIA_CONFIG_FILE**: Point to project-specific configuration files at `$RR/config/aia_config.yml`.
- **AIA_MODEL**: Set the primary default LLM for the project.
- **AIA_OUT_FILE** and **AIA_LOG_FILE**: Direct output and log files to the `$RR/logs/` directory.

### jq

`jq` is like `sed` for JSON data—you can use it to slice, filter, map, and transform structured data with the same ease that `sed`, `awk`, `grep`, and friends let you manipulate text.

**Website**: [jqlang.github.io/jq](https://jqlang.github.io/jq/)
**License**: MIT

#### Use Cases with AIA

Sometimes local JSON files can be large, containing data elements that are not relevant to the task at hand. You can use `jq` to pre-select, rearrange, and generally adapt your JSON data to just what is necessary to feed into the LLM without wasting money and time on unnecessary text tokens.

## Next Steps

**Installation and Setup:**
```bash
gem install aia
aia --help
```

**Major AIA Ruby Gem Dependencies:**

When you install AIA, it will also install all of its dependent libraries. These are the major libraries it uses in case you want to use them in your own code:

```bash
gem install ruby_llm         # Core LLM API library
gem install ruby_llm-mcp     # Model Context Protocol support
gem install prompt_manager    # Advanced prompt management
gem install shared_tools      # [Optional] Community tool collection
```

**Explore Further:**

- [AIA Documentation](https://github.com/madbomber/aia/blob/main/README.md)
- [AIA GitHub Repository](https://github.com/MadBomber/aia)
- [RubyLLM Tool Documentation](https://rubyllm.com/guides/tools)
- [RubyLLM MCP Integration](https://github.com/patvice/ruby_llm-mcp)
- [Prompt Manager Documentation](https://github.com/madbomber/prompt_manager)
- [Shared Tools Collection](https://github.com/madbomber/shared_tools)
