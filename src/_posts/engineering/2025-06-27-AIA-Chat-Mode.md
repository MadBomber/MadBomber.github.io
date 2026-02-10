---
title: "AIA Chat Mode"
categories:
  - Engineering
tags:
  - AIA
  - Ruby
  - Prompt Engineering
  - Chat
  - CLI
  - LLM
---

**Interactive AI Sessions: Mastering AIA's Chat Mode**

In the evolving landscape of AI-assisted workflows, real-time interaction with AI is increasingly valuable. This article, the fourth in our series, explores AIA's interactive chat mode, transforming it from a batch processing tool into a dynamic conversational partner. We'll cover the fundamentals of chat mode, its differences from batch mode, advanced features, practical use cases, and best practices to help you leverage AIA effectively.

## Series Articles

1. [The Philosophy of Prompt-Driven Development with AIA](https://madbomber.github.io/blog/engineering/AIA-Philosophy/)
2. [Mastering AIA's Batch Mode: From Simple Questions to Complex Workflows](https://madbomber.github.io/blog/engineering/AIA-Batch-Mode/)
3. [Building AI Workflows: AIA's Prompt Sequencing and Pipelines](https://madbomber.github.io/blog/engineering/AIA-Workflows/)
4. [Interactive AI Sessions: Mastering AIA's Chat Mode](https://madbomber.github.io/blog/engineering/AIA-Chat-Mode/)
5. [From Dynamic Prompts to Advanced Tool Integration](https://madbomber.github.io/blog/engineering/AIA-Advanced-Tool-Integration/)

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [Introduction to Chat Mode](#introduction-to-chat-mode)
    - [Starting a Chat Session](#starting-a-chat-session)
  - [Chat vs Batch: Key Differences](#chat-vs-batch-key-differences)
  - [Advanced Chat Features](#advanced-chat-features)
    - [Role-Based Conversations](#role-based-conversations)
    - [Model Switching](#model-switching)
    - [Interactive Directives](#interactive-directives)
  - [Practical Chat Patterns](#practical-chat-patterns)
    - [Example: Discussing Ruby Lambdas](#example-discussing-ruby-lambdas)
    - [Combining Batch and Chat Modes](#combining-batch-and-chat-modes)
      - [Example: Research Workflow with Batch and Chat](#example-research-workflow-with-batch-and-chat)
    - [Code Review Sessions](#code-review-sessions)
    - [Problem-Solving Workflows](#problem-solving-workflows)
  - [Session Management and Context](#session-management-and-context)
    - [Managing Conversation Context](#managing-conversation-context)
  - [Advanced Techniques for Chat Mode](#advanced-techniques-for-chat-mode)
  - [Best Practices for Interactive Sessions](#best-practices-for-interactive-sessions)
  - [Next Steps](#next-steps)

<!-- Tocer[finish]: Auto-generated, don't remove. -->

## Introduction to Chat Mode

AIA's chat mode, part of the AI Assistant (AIA) Ruby gem, is designed for real-time conversations with generative AI models. This makes it ideal for exploratory analysis, code reviews, or creative brainstorming. Unlike batch mode, which excels at predefined workflows, chat mode supports dynamic, back-and-forth interactions. It also provides access to AIA's full range of directives, shell integrations, and ERB templating, offering the same flexibility as batch mode in an interactive setting. For example, you can use `//include` to load files, `//shell` to execute commands, or ERB for dynamic prompts, all within a live session.

### Starting a Chat Session

To start a chat session, use the `--chat` flag:

```bash
aia --chat
```

Customize the session with specific models or roles:

```bash
aia --chat --model gpt-4 --role expert
```

## Chat vs Batch: Key Differences

Chat and batch modes serve distinct purposes, but they can be seamlessly integrated to create powerful workflows. By combining a prompt pipeline with the `--chat` flag, you can leverage the strengths of both modes. For example, using `aia research --pipeline analyze,summarize --chat` will first execute the batch pipeline (research, analyze and summarize) and then enter chat mode. This allows you to interactively explore the results or ask follow-up questions based on the processed context. The order of command-line parameters does not matter, ensuring flexibility in how you structure your commands.

| Aspect               | Chat Mode                          | Batch Mode                          |
|----------------------|------------------------------------|-------------------------------------|
| Use Cases            | Exploratory analysis, troubleshooting | Automation, large-scale processing  |
| Context Handling     | Maintains state across exchanges   | Stateless, processes prompts once   |
| Interaction          | Real-time, dynamic follow-ups      | Predefined, no interaction          |
| Advantages           | Flexible, iterative                | Efficient, repeatable               |
| Limitations          | Resource-intensive for long sessions | Less adaptable to changes           |

## Advanced Chat Features

AIA's chat mode offers powerful features to enhance interactivity:

### Role-Based Conversations

Roles define the AI's persona, tailoring responses to specific contexts. Create a role file in `~/.prompts/roles/`, such as `code_reviewer.txt`:

```
<!-- Define a code reviewer role -->
You are a senior software engineer with 15 years of experience
in Ruby development. Your task is to review the provided code
and suggest improvements for security, performance, and maintainability.
Be thorough and provide specific examples where possible.
```

Use it with:

```bash
aia --chat --role code_reviewer
```

### Model Switching

You can dynamically change the AI model during a session to suit different tasks. For example, start with a faster model like `gpt-3.5-turbo` for quick responses, then switch to a more capable model like `claude-3-5-sonnet` for complex analysis using the `//model` directive:

```
//model = claude-3-5-sonnet
```

To see available models, use:

```
//available_models [query]
```

Where [query] is an optional set of substrings used to filter the list of available models from the ruby_llm gem's model database down to just that set in which you have a focused interest. For example, models from a specific provider or models that have a specific modality.

```
//available_models image openai
```

The order of the query elements is unimportant.

### Interactive Directives

Directives like `//include` or `//shell` allow you to load files or execute commands mid-session. For example:

```
//include my_code.rb
Please review this code and suggest improvements.
```

## Practical Chat Patterns

Chat mode excels in real-time scenarios. Below are practical examples to demonstrate its capabilities.

### Example: Discussing Ruby Lambdas

This transcript shows a user starting a chat session and asking about Ruby lambdas:

```bash
22:22:17 3.4.4 v23.11.0 develop nibiru:develop $ aia --version
0.9.9
Exiting AIA application...
22:22:28 3.4.4 v23.11.0 develop nibiru:develop $ aia --chat

       ,      ,
       (\____/) AI Assistant (v0.9.9) is Online
        (_oo_)   gpt-4o-mini
         (O)       using ruby_llm (v1.3.1)
       __||__    \) model db was last refreshed on
     [/______\]  /    2025-06-25
    / \__AI__/ \/      You can share my tools
   /    /__\
  (\   /____\


Entering interactive chat mode...
═══════════════════════════════════════
Follow up (cntl-D or 'exit' to end) #=>
hello, lets talk about the Ruby programming language.  What is a lambda?

⏳ Processing...
[(●     )] Processing image,text TO text...

AI:
   Hello! In Ruby, a lambda is a type of proc, which is an
   object that encapsulates a block of code ...<snip>

───────────────────────────────────
Follow up (cntl-D or 'exit' to end) #=>
```

**Breakdown**:

- **Starting the Session**: The user runs `aia --chat`, and AIA displays its startup message, showing version 0.9.9, model (gpt-4o-mini), and model database refresh date.
- **User Query**: The user asks about Ruby lambdas, demonstrating natural-language input.
- **AIA Response**: AIA provides a detailed explanation with code examples, showcasing its ability to handle technical queries.
- **Session Continuity**: The session remains open for follow-up questions, as indicated by the prompt.

### Combining Batch and Chat Modes

AIA allows you to combine the strengths of batch and chat modes, enabling workflows that require both structured processing and interactive exploration. By specifying a prompt pipeline along with the `--chat` flag, AIA will first execute the batch pipeline and then transition into chat mode, using the context from the last prompt in the pipeline. This is particularly useful for tasks like research, where you want to automate initial analysis and then discuss the results interactively.

#### Example: Research Workflow with Batch and Chat

Consider the command:

```bash
aia research --pipeline analyze,summarize,report --chat
```

Here's how it works:

1. **Batch Processing**:
    - AIA executes the initial prompt (`research`) followed by the pipeline:
        - `research`: Researches the topic.
        - `analyze`: Analyzes the research topic.
        - `summarize`: Summarizes the analysis.
        - `report`: Generates a final report.
    - The context at the end of the last prompt in the pipeline is retained for the chat session.

2. **Transition to Chat Mode**:
    - After completing the pipeline, AIA enters chat mode.
    - You can now ask follow-up questions or request further analysis based on the report.
    - For example, you might ask, "What are the key takeaways from this report?" or "Can you provide more details on the summary?"

This pattern is ideal for workflows that require both automation and interactivity, such as:

- Research projects where you need to process data first and then explore insights.
- Code reviews where you want to analyze code automatically and then discuss specific issues.
- Data analysis tasks where you need to generate reports and then ask targeted questions.

### Code Review Sessions

Start with a code reviewer role:

```bash
aia --chat --role code_reviewer lib/my_class.rb
```

Add your source code files as initial context files on the command-line.

Follow up with questions/instructions like:

- Document each public method.
- What are the performance implications of this implementation?
- Can you suggest a more efficient algorithm?
- Create unit test cases for each public method.

### Problem-Solving Workflows

For debugging, use a role like `Rails_Expert`:

```bash
aia --chat --role Rails_Expert "app/**/*.rb"
```

Suppose you hit an exception while testing and have a long backtrace. Copy the exception error message and the backtrace into your clipboard and then paste that content into the interactive follow-up prompt and let the AI figure out the root cause.

## Session Management and Context

AIA's chat mode maintains context across exchanges, ensuring coherent conversations. Use `//include` to add files mid-session, e.g., `//include my_code.rb`. For long sessions, summarize key points or clear the context with `//clear` to manage context window size limits and control costs.

**Note**: Long conversations consume more tokens and increase costs. Use `//clear` periodically to reset context when switching topics.

### Managing Conversation Context

AIA retains the context of your conversation, including both your inputs and the AI's responses, enabling context-aware interactions. If you want to switch to an unrelated topic, use the `//clear` directive to reset the conversation state and start fresh. For example, after discussing Ruby lambdas, you might want to explore machine learning algorithms. Using `//clear` ensures the AI doesn't carry over prior context, providing a clean slate for the new topic.

When you want to see a recap of your conversation you can use the `//context` directive to show what you typed and the responses that you received.

## Advanced Techniques for Chat Mode

- **Dynamic Role Switching**: Start a new session with a different role, e.g., `aia --chat --role technical_writer`, to shift perspectives. Or stay in current session, clear the context, then include a new role `//include $AIA_ROLES_DIR/technical_writer.txt`.
- **Shell Integration**: Use system environment variables and shell commands in your conversation: "What is the largest process? $(ps aux)"
- **ERB Integration**: Use ERB for dynamic content e.g. `<%= User.find(id).orders.last %>` in your conversation context.

## Best Practices for Interactive Sessions

- **Preparation**: Define objectives and load context files (e.g., code or logs) on the command-line.
- **Conversation Management**: Ask focused questions, build context incrementally, and document insights.
- **Security**: Avoid sensitive data, use restrictive permissions for `~/.prompts` (e.g., `chmod 700 ~/.prompts`), and review logs.
- **Efficiency**: Use `--terse` for quicker responses or adjust `max_tokens` via `//config max_tokens=1000` for longer replies.
- **Model Selection**: Choose the appropriate model based on the task complexity and desired response length. For example, use `gpt-3.5-turbo` for shorter responses and `gpt-4` for more detailed and complex tasks.
- **Cost Management**: Monitor token usage in long sessions and use `//clear` to reset context when switching topics.

## Next Steps

AIA's chat mode empowers real-time human-AI collaboration, offering flexibility for exploration and problem-solving. The Ruby lambda example and the batch-to-chat workflow demonstrate its ability to deliver context-aware, technical responses and integrate structured automation with interactive discussions.

With features like context management, model switching, and full directive support, chat mode is a versatile tool for developers, writers, creatives, power users and beyond. The next article will explore extending AIA with custom tools, further enhancing its capabilities.

**Installation and Setup**:
```bash
gem install aia
aia --help
```

**Explore Further**:
- [AIA Documentation](https://github.com/madbomber/aia/blob/main/README.md)
- [AIA GitHub Repository](https://github.com/MadBomber/aia)
