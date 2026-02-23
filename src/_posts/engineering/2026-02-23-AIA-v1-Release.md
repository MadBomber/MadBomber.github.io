---
title: "What's New in AIA v1.0.0"
categories:
  - Engineering
tags:
  - AIA
  - Ruby
  - CLI
  - LLM
  - Release Notes
  - Prompt Engineering
  - Multi-Model
  - MCP
---

AIA (AI Assistant) hit version 1.0.0 on February 22, 2026. It started in 2023 as a Ruby script called `aip.rb` that piped prompts into `mods`. Three years later, it talks to hundreds of models across dozens of providers, runs multiple models concurrently, and connects to MCP servers for tool access.

This post covers what changed, what's new, and how to migrate.

## What is AIA?

AIA is a Ruby CLI that manages prompts as files rather than strings buried in application code. Prompts live in their own files with parameters, directives, shell integration, and embedded Ruby. AIA sends them to LLM models via the [ruby_llm](https://rubyllm.com) gem, which supports 500+ models from 20+ providers.

```bash
gem install aia
```

The core philosophy remains: **the prompt is the code**. The big difference in v1.0.0 is that prompts are now `.md` files with YAML front matter and ERB parameters instead of `.txt` files with `[PLACEHOLDER]` syntax.

## Breaking Changes

If you used AIA v0.9.x or earlier, these are the changes that will affect your existing prompts and workflows.

### New Prompt File Format

The biggest change is how prompts are structured. Prompts are now `.md` files with YAML front matter instead of `.txt` files with sidecar `.json` metadata.

**Before (v0.9.x):**

```
# ~/.prompts/analyze.txt
//config model = gpt-4o-mini
//config temperature = 0.3
As a [ROLE], analyze [TOPIC] and provide insights.
```

With a separate `analyze.txt.json` file storing parameter history.

**After (v1.0.0):**

```markdown
---
model: gpt-4o-mini
temperature: 0.3
parameters:
  - role: null
  - topic: null
---
As a <%= role %>, analyze <%= topic %> and provide insights.
```

Everything in one `.md` file. Configuration lives in YAML front matter. Parameters use ERB syntax.

### Key Syntax Changes

| What | Old | New |
|------|-----|-----|
| File extension | `.txt` | `.md` |
| Parameters | `[PLACEHOLDER]` | `<%= placeholder %>` |
| Chat directives | `//config` | `/config` (single slash, chat-time only) |
| Comments | `# line comment` | `<!-- HTML comment -->` |
| File inclusion | `//include file.md` | `<%= include('file.md') %>` (also `//include`) |
| Configuration | `//config key = value` | YAML front matter |
| Metadata storage | Separate `.json` sidecar | YAML front matter block |

### Removed Features

- **`--exec` flag**: Removed. Executable prompts now use shebang auto-detection (`#!/usr/bin/env aia`).
- **`//next` and `//pipeline` directives**: Removed from directive system. Use `--next` / `--pipeline` CLI flags or front matter instead.
- **`--adapter` flag**: Removed. AIA now exclusively uses `ruby_llm` as its LLM interface.
- **Environment variable naming**: Changed to nested convention with double underscores (e.g., `AIA_PROMPTS_DIR` became `AIA_PROMPTS__DIR`, `AIA_CHAT` became `AIA_FLAGS__CHAT`). `AIA_MODEL` remains unchanged.

### Migration Tool

A migration script in the [AIA repository](https://github.com/MadBomber/aia) handles the conversion automatically:

```bash
git clone https://github.com/MadBomber/aia.git
cd aia

# Preview changes first
bin/migrate_prompts --dry-run --verbose ~/.prompts/

# Run the migration
bin/migrate_prompts ~/.prompts/
```

The tool converts `.txt` + `.json` pairs into `.md` files, migrates parameters from `[PLACEHOLDER]` to `<%= placeholder %>`, converts directives and comments, and moves configuration into YAML front matter. Files with ambiguous patterns (code fences, nested brackets) are flagged as `.txt-review` for manual inspection. Use `--reprocess` to re-examine those later.

## What's New in v1.0.0

### Multi-Model Concurrent Execution

AIA can query multiple models at the same time:

```bash
# Get three perspectives in parallel
aia --model "gpt-4o,claude-3-5-sonnet,gemini-1.5-pro" analyze

# Or synthesize them into a unified answer
aia --model "gpt-4o,claude-3-5-sonnet" --consensus analyze
```

Each model runs in its own fiber via Ruby's Async framework. You get individual responses by default; `--consensus` folds them into one answer. Wall-clock time is roughly the slowest model, not the sum.

### Per-Model Role Assignment

Assign specific roles to each model:

```bash
aia --model gpt-4o=architect,claude-3-5-sonnet=security,gemini-1.5-pro=performance code_review src/app.rb
```

Use the same model with different perspectives:

```bash
aia --model gpt-4o=optimist,gpt-4o=pessimist,gpt-4o=realist evaluate_proposal
```

### Token Usage and Cost Tracking

```bash
aia --model gpt-4o,claude-3-5-sonnet --cost my_prompt
```

Displays per-model token counts and actual cost, plus projected cost at scale (x1000).

### MCP (Model Context Protocol) Integration

AIA connects to MCP servers so models can call external tools:

```bash
# Load MCP server configuration
aia --chat --mcp mcp_config.json

# Filter which servers to use
aia --chat --mcp config.json --mcp-use github,filesystem
```

Connections are fiber-based and parallel. MCP servers for git, databases, file systems, cloud services, and dev tools all work.

### RubyLLM Tool Support

You can write custom tools as `RubyLLM::Tool` subclasses, or pull in ready-made ones from the `shared_tools` gem:

```bash
# Load shared tools
aia --chat --require shared_tools/ruby_llm

# Load custom tool files
aia --chat --tools ~/my-tools/

# Discover available tools
aia --list-tools
```

### Executable Prompts

Prompts can be executable scripts. AIA detects the shebang:

```bash
#!/usr/bin/env aia --no-output
---
model: gpt-4o-mini
---
Summarize today's git activity:

<%= `git log --oneline --since="1 day ago"` %>
```

Make it executable with `chmod +x` and run it directly.

### Chat Mode with Checkpoints

You can checkpoint a conversation and roll back to it:

```
/checkpoint before_refactor
... discuss refactoring approach ...
/restore before_refactor
... try a different approach ...
```

### Local Model Support

Ollama and LM Studio work out of the box:

```bash
# Ollama
aia --model ollama/llama3 my_prompt

# LM Studio
aia --model lms/deepseek-coder my_prompt
```

### Image Generation

DALL-E works too:

```bash
aia --model dall-e-3 --image-size 1024x1024 --image-quality hd generate_image
```

### Unix Pipeline Integration

AIA reads from STDIN when input is piped, and `--no-output` sends the LLM response to STDOUT instead of a file. So it sits anywhere in a pipeline:

```bash
# Pipe input through AIA to another command
ls -alf | aia --no-output summarize_listing | sort

# Use a prompt to process command output
git diff HEAD~3 | aia --no-output code_review

# Chain multiple AIA calls
cat report.csv | aia --no-output analyze_data | aia --no-output write_summary > final.md
```

When STDIN is not a terminal, AIA knows it is receiving piped input. If you also give a prompt ID, the piped content gets appended to the prompt text. Without a prompt ID, the piped content *is* the prompt.

A small shell function makes one-off questions easy:

```bash
ask() { echo "$1" | aia --no-output; }
ask "What are the SOLID principles?"
```

### Security Hardening

v1.0.0 fixes real security problems: backtick shell interpolation is replaced with safe array-form process execution, tempfile handling for audio is hardened, exception rescues are narrowed, and critical dependencies are pinned.

## The Journey: From aip.rb to v1.0.0

If you have been following along on this blog, here is how AIA got here:

- **August 2023**: [Parameterized AI Prompts](/blog/engineering/Parameterized-AI-Prompts/) introduced `aip.rb`, a simple Ruby script using `mods` as the LLM backend. Prompts were `.txt` files with `[KEYWORD]` placeholders.

- **January 2024**: [AIA and Pre-compositional AI Prompts](/blog/engineering/AIA-and-Pre-compositional-AI-Prompts/) documented the first proper AIA release with directives (`//config`), shell integration, ERB support, and the `prompt_manager` gem.

- **November 2024**: [The Prompt IS The Code](/blog/engineering/The-Prompt-IS-The-Code/) explored the philosophical framework: treating prompts as a higher-order language with SOLID principles.

- **June-July 2025**: A [five-part series](/blog/engineering/AIA-Philosophy/) walked through AIA v0.9.x: philosophy, batch mode, workflows, chat mode, and tool integration.

- **August-October 2025**: Articles on [concurrent multi-model execution](/blog/engineering/AIA-is-concurrently-multi-model/) and [per-model role assignment](/blog/engineering/multi-model-roles/) covered the major architectural additions.

- **February 2026**: v1.0.0 ships with the new `.md` prompt format, ERB parameters, MCP integration, command injection fixes, and 774 tests passing.

Those earlier articles are still up, with notes pointing here for the current state of things.

## Getting Started

### Install

```bash
gem install aia
```

### Verify

```bash
aia --version
# 1.0.0
```

### Quick Setup

```bash
# Create prompts directory
mkdir -p ~/.prompts

# Set environment
export AIA_PROMPTS__DIR="$HOME/.prompts"

# Create your first v1.0.0 prompt
cat > ~/.prompts/hello.md << 'EOF'
---
model: gpt-4o-mini
parameters:
  - topic: Ruby programming language
---
Tell me something interesting about <%= topic %>.
EOF

# Run it
aia hello
```

### If Upgrading from v0.9.x

```bash
gem update aia

# Clone the repo for the migration tool
git clone https://github.com/MadBomber/aia.git
cd aia
bin/migrate_prompts --dry-run ~/.prompts/
bin/migrate_prompts ~/.prompts/
```

## Documentation

Full docs are at [madbomber.github.io/aia](https://madbomber.github.io/aia):

- [Installation](https://madbomber.github.io/aia/installation/)
- [Configuration](https://madbomber.github.io/aia/configuration/)
- [CLI Reference](https://madbomber.github.io/aia/cli-reference/) (40+ flags)
- [Directives Reference](https://madbomber.github.io/aia/directives/)
- [Guides](https://madbomber.github.io/aia/guides/getting-started/) (Getting Started through Advanced Topics)
- [MCP Integration](https://madbomber.github.io/aia/mcp-integration/)
- [Security](https://madbomber.github.io/aia/security/)
- [Migrating Prompts](https://madbomber.github.io/aia/guides/migrating-prompts/)

## Resources

- [AIA GitHub Repository](https://github.com/MadBomber/aia)
- [AIA Documentation Site](https://madbomber.github.io/aia)
- [RubyLLM](https://rubyllm.com) -- the LLM API library powering AIA
- [prompt_manager](https://github.com/MadBomber/prompt_manager) -- prompt file management
- [shared_tools](https://github.com/MadBomber/shared_tools) -- community tool collection
- [ruby_llm-mcp](https://github.com/patvice/ruby_llm-mcp) -- MCP protocol support

---

*`gem install aia` -- works with OpenAI, Anthropic, Google, DeepSeek, Mistral, Ollama, LM Studio, and others via [ruby_llm](https://rubyllm.com).*

---

## Why I use it

People ask me what the "best feature" of AIA is. That depends on who you are. What I can tell you is why I, as the author and a daily user who lives on the command line, keep reaching for it.

For personal use, I replaced browser search. I keep an AIA chat session in a terminal tab. No ads, no sponsored results, no clicking through five SEO-optimized pages to find a one-line answer. I just ask.

For work, the question that matters is: *what does this prompt cost with this model?* AIA's `--chat` mode with `--model` and `--cost` lets me throw the same prompt at several models and see the answers side by side with their price tags. That is how I learned that last year's models, at a tenth of the price, usually give me the same quality as the latest frontier release. Not always. But often enough that I stopped defaulting to the most expensive option.

### Prompts as code

A prompt by itself does nothing. It needs a model to run it, training data for the model to draw on, and clear enough instructions to produce useful output. AIA is the execution layer that connects those pieces. You write the prompt in a `.md` file, AIA handles the rest: parameter substitution, model routing, cost tracking, tool integration.

### Multi-model comparison in practice

Run `--chat` with a comma-separated `--model` list and the `--cost` flag. You see each model's response plus the exact cost. After a few rounds of this, you stop guessing about which model to use for a given task and start knowing.

I have found that expensive does not reliably mean better. A model that costs 10x more sometimes gives a marginally better answer, sometimes gives a worse one, and usually gives roughly the same one. The only way to find out is to compare, and AIA makes comparing cheap and fast.

---

*`gem install aia` -- works with OpenAI, Anthropic, Google, DeepSeek, Mistral, Ollama, LM Studio, and others via [ruby_llm](https://rubyllm.com).*
