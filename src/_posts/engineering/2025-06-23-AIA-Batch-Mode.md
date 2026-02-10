---
title: "AIA Batch Mode"
categories:
  - Engineering
tags:
  - AIA
  - Ruby
  - Prompt Engineering
  - Batch Processing
  - CLI
  - Automation
---

**Mastering AIA's Batch Mode: From Simple Questions to Complex Workflows**

AIA (AI Assistant) is a command-line interface (CLI) written in Ruby, designed to be a powerful, flexible, and scriptable partner for your daily tasks. This article is the second in a comprehensive series providing a deep dive into the AIA CLI, focusing on its non-interactive "batch mode" — the foundation of AIA's powerful AI processing capabilities. The example prompts used in this article are for illustration purposes. While AIA is a daily tool for my software development activities along with claude code and aider, AIA is also a powerful business and recreational tool.  Like any coding language, AIA's batch mode is domain agnostic.  Whether you use it to review or develop software source code, write documentation, or generate content for marketing materials, AIA's batch mode can help you automate tasks and streamline your workflow.

**Series Articles:**

1. [The Philosophy of Prompt-Driven Development with AIA](https://madbomber.github.io/blog/engineering/AIA-Philosophy/)
2. [Mastering AIA's Batch Mode: From Simple Questions to Complex Workflows](https://madbomber.github.io/blog/engineering/AIA-Batch-Mode/)
3. [Building AI Workflows: AIA's Prompt Sequencing and Pipelines](https://madbomber.github.io/blog/engineering/AIA-Workflows/)
4. [Interactive AI Sessions: Mastering AIA's Chat Mode](https://madbomber.github.io/blog/engineering/AIA-Chat-Mode/)
5. [From Dynamic Prompts to Advanced Tool Integration](https://madbomber.github.io/blog/engineering/AIA-Advanced-Tool-Integration/)

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [Introduction: AIA's File-Based Philosophy](#introduction-aias-file-based-philosophy)
  - [Prompts and Roles: Defining the Task and Persona](#prompts-and-roles-defining-the-task-and-persona)
  - [User Comments: Documenting Your Prompts](#user-comments-documenting-your-prompts)
  - [Context and Configuration: Inputs and Outputs](#context-and-configuration-inputs-and-outputs)
  - [Understanding Context Processing](#understanding-context-processing)
    - [Context Files as CLI Arguments](#context-files-as-cli-arguments)
    - [File Redirection Limitation](#file-redirection-limitation)
    - [Piped Content](#piped-content)
    - [Context Content Source Exclusions](#context-content-source-exclusions)
  - [CLI Integration: AIA as a Shell Command](#cli-integration-aia-as-a-shell-command)
    - [Executable Prompts](#executable-prompts)
  - [Dynamic Prompts Part 1: Parameters](#dynamic-prompts-part-1-parameters)
  - [Dynamic Prompts Part 2: Shell Integration](#dynamic-prompts-part-2-shell-integration)
  - [Dynamic Prompts Part 3: ERB for Advanced Logic](#dynamic-prompts-part-3-erb-for-advanced-logic)
  - [Putting It All Together: A World-Building Assistant](#putting-it-all-together-a-world-building-assistant)
  - [AIA Directives: In-Prompt Commands](#aia-directives-in-prompt-commands)
    - [Directives Quick Reference](#directives-quick-reference)
    - [Context-Modifying Directives](#context-modifying-directives)
    - [Configuration & Flow-Control Directives](#configuration--flow-control-directives)
    - [Interactive & Informational Directives](#interactive--informational-directives)
    - [Advanced: Creating Your Own Directives](#advanced-creating-your-own-directives)

<!-- Tocer[finish]: Auto-generated, don't remove. -->

## Introduction: AIA's File-Based Philosophy

AIA organizes its functionality around a simple but powerful file-based structure. At its core, AIA expects a **PROMPT_ID** which corresponds to the name of a text file (e.g., `summarize.txt`) located in your prompts directory.

The environment variable `AIA_PROMPTS_DIR` holds the path to this directory. If not set, AIA defaults to `~/.prompts`. You can use subdirectories to organize your prompts logically.

```bash
# Environment variable for prompts location
export AIA_PROMPTS_DIR="$HOME/.prompts"

# Directory structure example
$AIA_PROMPTS_DIR/
├── summarize.txt
├── coding/
│   ├── review.txt
│   └── debug.txt
└── creative/
    ├── story_idea.txt
    └── rpg_character.txt
```

To run the `review` prompt, you would use the `coding/review` PROMPT_ID: `aia coding/review`.

## Prompts and Roles: Defining the Task and Persona

AIA separates the *task* (the prompt) from the *persona* (the role). A role is simply a special prompt that sets the context for the LLM, telling it *how* to behave.

Roles are stored in the `AIA_ROLES_DIR` (defaulting to `$AIA_PROMPTS_DIR/roles`).

**Prompt Example (The Task):** `creative/story_idea.txt`
This prompt file defines a simple task: generate a story idea.

```
Generate a compelling story idea based on the following elements.
Provide a title, a one-paragraph synopsis, and a protagonist description.

Elements:
[CONTENT]
```

**Role Example (The Persona):** `roles/storyteller.txt`
This role file defines the persona the AI should adopt.

```
You are a master storyteller, known for weaving intricate plots
and creating unforgettable characters. Your style is evocative,
imaginative, and slightly mysterious.
```

By combining a prompt and a role, you give the LLM clear instructions on both **what to do** and **who to be**.

```bash
# Let's get a story idea from a master storyteller
echo "Genre: Sci-Fi, Setting: Underwater city, Theme: Betrayal" | aia creative/story_idea --role storyteller
```

## User Comments: Documenting Your Prompts

You can add comments to your prompt files that are for your eyes only. AIA strips them out before sending the prompt to the AI. This is perfect for adding notes, to-do items, or explanations.

AIA supports several comment styles:
*   `#` at the start of a line (unless inside a markdown code block).
*   HTML-style comments: `<!-- ... -->`
*   ERB-style comments: `<%# ... %>`
*   Everything after a line containing only `__END__`

**Example:** `documented_prompt.txt`
While this example uses some advanced features we'll cover later, focus for now on how the different comment types are used to document the prompt's intent.

```erb
# This prompt generates a character for a role-playing game.
# It uses ERB to add a little flair.

<!--
  This multiline comment explains the strategy.
  We'll ask the user for a class and race, then use ERB
  to generate a unique item based on the current minute.
-->

<%# This ERB comment explains the Ruby logic. %>
<%
  # Generate a "lucky number" for the character.
  lucky_number = Time.now.min % 10 + 1
%>

Create a character for our campaign.

  ```
  # This hash symbol is inside a code block, so it's NOT a comment.
  # It will be sent to the LLM.
  ```

Your lucky number is: <%= lucky_number %>

__END__
This entire section is ignored by the AI.

TODO: Add support for more character classes.
Author: The Dungeon Master
Last Updated: 2024-05-20
```

## Context and Configuration: Inputs and Outputs

By default, AIA processes input from files passed on the command line or from STDIN, and it saves the output to a file named `temp.md`. You can easily change this behavior.

```bash
# Provide a file as context
aia summarize my_document.txt

# Pipe content from another command into AIA (output goes to STDOUT)
some_shell_command | aia some_prompt_id --no-out_file

# Specify a custom output file
aia summarize my_document.txt --out_file summary_v1.md
```

All command-line options can also be set via environment variables (`export AIA_OUT_FILE="summary.md"`) or in a central configuration file for consistent behavior.

## Understanding Context Processing

There are three ways in which context can be added to a prompt for processing. Each way has some limitations which need to be taken into account as you craft your prompts and workflows.

Context content comes from three different sources:

1. **CLI Arguments**: `aia prompt_id stuff.txt other_stuff.txt`
2. **File Redirection**: `aia prompt_id < stuff.txt < other_stuff.txt < more_stuff.txt`
3. **Piped Content**: `echo "stuff" | aia prompt_id`

### Context Files as CLI Arguments

The content of files that you specify on the command line as arguments will have their content processed "as is" without any dynamic content changes.  Their content will not be checked for AIA parameters, shell or ERB integration. This is the most common way to add context to a prompt.  For example, code files, image files, audio files will all be passed to the LLM for processing without any changes to their content.

### File Redirection Limitation

`aia prompt_id < other_stuff.txt < more_stuff.txt`

The content coming from file redirection will not be checked for AIA parameters; however, any shell or ERB integration statements will be executed and their values substituted in the redirected file's content.  The actual file itself will not be modified, only that content that is sent to the LLM for processing.

AIA does not limit the number of files which can have their content redirected into STDIN.

### Piped Content

`echo "stuff" | aia prompt_id`

This content is treated the same way as redirected file content.  No AIA parameter processing will take place.  Both shell and ERB integration statements will be executed.  The output from this execution will be substituted for the commands within the piped content to be processed by the LLM.

### Context Content Source Exclusions

`echo "stuff" | aia prompt_id < other_stuff.txt` has a limitation. **Piped Content is Ignored**

Both piped content and content coming from file redirection are coming into the AIA program via an IO stream called STDIN - standard input.  In the Ruby programming language there is a limitation that allows only content from one source of STDIN. In the case of piped content and content coming from redirected files, Ruby will ignore the piped content and only process the content from the redirected files.

If you want both "stuff" and the content of the other_stuff.txt file to be processed for their shell and ERB integration then you must concat the two contents together outside of the AIA program.  Here is one way to do that:

`echo "stuff" | cat - other_stuff.txt | aia prompt_id`

## CLI Integration: AIA as a Shell Command

AIA is a first-class citizen of the command line. You can pipe data in and out of it, making it a powerful component in your shell scripts and workflows.

```bash
# Find all "TODO" comments in Ruby files and ask AIA to prioritize them
grep -r "TODO" ./**/*.rb | aia prioritize_tasks --no-out_file

# Create a handy 'ask' function in your .bashrc or .zshrc
ask() {
  echo "$1" | aia run --no-out_file
}

# The 'run' prompt is a simple prompt that establishes a generic
# environment or persona.  For example the prompt's text file could
# contain the text "be a good little robot and answer my questions
# in a friendly tone."  The prompt ID does not have to be named run;
# implement what makes sense to you.

# Now you can ask quick questions from anywhere
ask "What are the three most popular fantasy tropes?"

# AIA has shell integration
ask "Which process is the largest? $(ps aux)"

# AIA has ERB integration
ask "what is the decimal probability of rolling <%= rand(12)+2 %> using two six sided dice?"
```

### Executable Prompts

As a shell command you can make your prompts executable! Create a file named `gcm` in your `$PATH`, make it executable (`chmod +x gcm`), and add the following content:

```bash
#!/usr/bin/env aia run --no-out_file
Generate a git commit message that summarizes the following staged changes.
The message should follow the conventional commit format.

$(git diff --staged)
```
Now, running `gcm` will generate a commit message for you.

## Dynamic Prompts Part 1: Parameters

Parameters make your prompts reusable. AIA uses the default syntax `[PARAMETER_NAME]` to identify placeholders. When you run a prompt with parameters, AIA will ask you to provide a value for each one.

**Example:** `rpg/character.txt`
This prompt uses parameters to create a custom RPG character.

```
Create a fantasy RPG character with the following attributes.
Provide a detailed backstory, their primary motivation, and
a unique personality quirk.

Name: [CHARACTER_NAME]
Race: [RACE]
Class: [CLASS]
```

When you run it, AIA prompts you for the values:

```bash
$ aia rpg/character
CHARACTER_NAME: Kaelen Nightwind
RACE: Wood Elf
CLASS: Ranger
```

AIA substitutes these values into the prompt before sending it to the LLM. It even remembers the last 5 values you used for each parameter, so you can easily reuse them.

## Dynamic Prompts Part 2: Shell Integration

AIA can execute shell commands and embed their output directly into your prompt. This allows you to create prompts that are aware of the system they're running on.

**Example:** `writing/daily_prompt.txt`
This prompt for writers uses the `date` command to create a unique, time-sensitive writing challenge.

```
Today is $(date +"%A, %B %d, %Y").

Your writing prompt for today is:
Write a short, 200-word story about a character who discovers
an object that doesn't belong in their world. The story should
reflect the mood of a typical [SEASON] day.

Season to capture: [SEASON]
```

When run, `$(date ...)` is replaced with the current date, giving the LLM real-world context for its creative task.

## Dynamic Prompts Part 3: ERB for Advanced Logic

For the ultimate in dynamic content, AIA supports ERB (Embedded Ruby). This lets you use Ruby code inside your prompts for conditional logic, loops, and more.

**Example:** `creative/scene_generator.txt`
This prompt generates a story scene, but the mood changes based on the time of day you run it, thanks to ERB.

```erb
<%# Use Ruby to determine the time of day %>
<% current_hour = Time.now.hour %>

<% if current_hour < 12 %>
The scene opens on a crisp, hopeful morning.
<% elsif current_hour < 18 %>
The scene takes place under the harsh light of the afternoon sun.
<% else %>
The scene is cloaked in the shadows of evening.
<% end %>

Based on this setting, write a scene that accomplishes the following:
[SCENE_DESCRIPTION]
```
This allows a single prompt file to produce dramatically different results based on simple programmatic logic.

## Putting It All Together: A World-Building Assistant

Let's combine these features into a powerful, non-technical tool: an RPG world-builder.

**Prompt:** `rpg/world_builder.txt`
```erb
# This is a world-building assistant for our new RPG campaign.
# It combines user input, shell commands, and ERB logic.

<%# Get parameters from the user %>
<%
  world_name      = '[WORLD_NAME]'
  magic_system    = '[MAGIC_SYSTEM_TYPE]'
  creator_name    = ENV['USER'] || 'The Architect'
%>

## World Bible for: <%= world_name %>
**Created By:** <%= creator_name %>
**Date:** $(date)

### Core Concept
The world of **<%= world_name %>** is defined by its unique approach to magic.

<% if magic_system.downcase == 'elemental' %>
Magic is raw and chaotic, drawn directly from the natural elements:
fire, water, earth, and air. Mages are more like conduits than scholars.
<% elsif magic_system.downcase == 'arcane' %>
Magic is a scholarly pursuit, based on ancient runes, complex incantations,
and the manipulation of cosmic energies. It requires intense study.
<% else %>
Magic in this world is rare and mysterious, its rules unknown. Describe
what a "low magic" setting might feel like.
<% end %>

### Factions
Please generate three major factions for this world, including their
goals and their view on the magic system.

---
//shell mkdir -p "<%= world_name %>/factions"
A directory has been created at: $(pwd)/<%= world_name %>
```
This single prompt:
1.  Asks for a `[WORLD_NAME]` and `[MAGIC_SYSTEM_TYPE]`.
2.  Uses an environment variable (`$USER`) for the creator's name.
3.  Uses ERB to provide a different description based on the type of magic system.
4.  Uses a `//shell` directive (more on directives next!) to create a directory for the new world on your computer.

## AIA Directives: In-Prompt Commands

Directives are special commands, prefixed with `//`, that you can place inside your prompts. They give you fine-grained control over AIA's behavior, let you inject content, and manage workflows. They are a tribute to the power of IBM's classic Job Control Language (JCL).

### Directives Quick Reference

| Directive | Aliases | Adds to Context? | Primary Use |
| :--- | :--- | :--- | :--- |
| **//include** | `//import` | **Yes** | Batch & Chat |
| **//ruby** | `//rb` | **Yes** | Batch & Chat |
| **//shell** | `//sh` | **Yes** | Batch & Chat |
| **//webpage** | | **Yes** | Batch & Chat |
| **//terse** | | **Yes** | Batch & Chat |
| **//config** | `//cfg` | No | Batch & Chat |
| **//next** | | No | Batch (Workflow) |
| **//pipeline** | `//workflow` | No | Batch (Workflow) |
| **//model** | | No | Batch & Chat |
| **//temperature**| `//temp` | No | Batch & Chat |
| **//top_p** | `//topp` | No | Batch & Chat |
| **//available_models**| `//am`, `//llms` | No | Chat-Only |
| **//clear** | | No | Chat-Only |
| **//help** | | No | Chat-Only |
| **//review** | `//context` | No | Chat-Only |
| **//robot** | | No | Chat-Only |
| **//tools** | | No | Chat-Only |
| **//say** | | No | Batch & Chat |

### Context-Modifying Directives

These directives inject content directly into your prompt.

*   `//include <file_path>`: Inserts the full content of a file.
    ```
    //include path/to/my_character_sheet.txt
    ```
*   `//shell <command>`: Executes a shell command and inserts its output.
    ```
    Current Directory Listing:
    //shell ls -l
    ```
*   `//ruby <ruby_code>`: Executes a line of Ruby and inserts its result.
    ```
    There are
    //ruby Dir.glob("**/*.txt").count
    text files here.
    ```
*   `//webpage <url>`: Fetches the content of a URL as markdown and inserts it (requires `PUREMD_API_KEY`).
    ```
    //webpage https://github.com/madbomber/aia/blob/main/README.md
    ```
*   `//terse`: Inserts a standard instruction to the AI to keep its response brief.

### Configuration & Flow-Control Directives

These directives change how AIA behaves, but don't add content to the prompt itself.

*   `//config <key> = <value>`: Sets any configuration value for the current run.
    ```
    //config temperature = 0.2
    ```
*   `//model <model_name>`: A shortcut for `//config model = <model_name>`.
    ```
    //model claude-3-haiku
    ```
*   `//next <prompt_id>`: Chains prompts together. After this prompt finishes, AIA will automatically run the `next` one.
    ```
    //next analyze_results
    ```
*   `//pipeline <id_1> <id_2>`: Like `//next`, but for a whole sequence of prompts.
    ```
    //pipeline extract_data clean_data generate_report
    ```

### Interactive & Informational Directives

These are primarily for use in AIA's interactive chat mode to manage the session.

*   `//help`: Shows a list of available directives.
*   `//review`: Displays the conversation history so far.
*   `//clear`: Clears the conversation history to start fresh.
*   `//available_models`: Lists all AI models you can use.
*   `//robot`: Displays the friendly AIA ASCII art robot.

### Advanced: Creating Your Own Directives

Want to add your own magic command, like `//my_directive`? It's easy! Just define a private method in the `AIA::Directives` class and load the file using the `--require` option.

```ruby
# my_directives.rb
class AIA::Directives
  private

  desc "My fancy magic secret directive"
  def my_fancy_magic_secret_directive(args, context_manager=nil)
    return '' if args.empty? # args is an Array of Strings
    "Poof! I made the prompt context contain #{args.join(", ")}"
  end
  alias_method :mine!, :my_fancy_magic_secret_directive
end
```
```bash
# Now you can use it!
aia my_prompt --require ./my_directives.rb
```

---

**Resources:**
- [AIA GitHub Repository](https://github.com/madbomber/aia)
- [AIA Wiki Documentation](https://github.com/MadBomber/aia/wiki)
- [Ruby ERB Documentation](https://docs.ruby-lang.org/en/master/ERB.html)

This article has covered the core of AIA's batch mode, from simple text files to dynamic, multi-stage workflows. With these tools, you can transform the command line into an intelligent, automated assistant for any task, be it coding, writing, or world-building. Understanding the critical distinction between context file processing and piped content processing will help you build more predictable and powerful workflows. Stay tuned for the next article, where we'll dive even deeper into prompt sequencing and pipelines.
