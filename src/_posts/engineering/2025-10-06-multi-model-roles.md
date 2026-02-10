---
layout: blog_post
title: "Unleash the Power of Perspective: Multi-Model AI with Role-Based Collaboration"
date: 2025-10-06
categories:
  - Engineering
tags:
  - AIA
  - Ruby
  - AI
  - Multi-Model
  - LLM
  - CLI
---

![Multi-Model Robots with Different Hats](/blog/images/3_robots_with_hats.jpg)

What if you could assemble a team of AI experts, each with their own specialized perspective, to tackle your toughest challenges? That's exactly what AIA's enhanced multi-model system enables. In this post, we'll explore how AIA v0.9.20 revolutionizes AI interaction by letting you assign specific roles to different models, track their performance with precision, and synthesize their insights into breakthrough solutions.

## The Multi-Model Revolution

Traditional AI workflows often force you to pick one model and hope it has the right balance of capabilities for your task. Should you use GPT-4 for its reasoning? Claude for its analysis? Gemini for its structured thinking? Why choose when you can have all three working together?

AIA's multi-model system breaks down these artificial barriers. You can run multiple AI models simultaneously, each contributing their unique strengths to solve your problem from different angles.

## The Game-Changer: Per-Model Role Assignment

Here's where it gets really interesting. With AIA v0.9.20, you don't just run multiple models—you assign each one a specific role that shapes their perspective and expertise.

### The Inline Role Syntax

Assigning roles is as simple as using the `MODEL=ROLE` syntax:

```bash
# Assign the architect role to GPT-4o
aia --model gpt-4o=architect design_review.md

# Multiple models, each with their specialized role
aia --model gpt-4o=architect,claude=security,gemini=performance architecture_proposal.md
```

Each role is a carefully crafted prompt that prepends to your main question, shaping how that model approaches the problem.

### Multiple Perspectives from the Same Model

Here's where things get really powerful. Want to see your project from optimistic, pessimistic, and realistic viewpoints? Use the same model three times with different roles:

```bash
aia --model gpt-4o=optimist,gpt-4o=pessimist,gpt-4o=realist project_plan.md
```

AIA automatically:
- Numbers each instance (`gpt-4o`, `gpt-4o #2`, `gpt-4o #3`)
- Maintains separate conversation contexts for each
- Ensures no cross-talk between instances

The output clearly shows each perspective:

```
from: gpt-4o (optimist)
This project has tremendous potential! The architecture is solid and the team
is well-positioned to deliver. I see several opportunities for early wins...

from: gpt-4o #2 (pessimist)
We need to address some serious concerns here. The timeline is aggressive,
dependencies are unclear, and we're missing critical infrastructure...

from: gpt-4o #3 (realist)
Let's balance these perspectives. The proposal is feasible but needs adjustment.
Here's a pragmatic roadmap that addresses the risks while capitalizing on...
```

### Creating and Discovering Roles

Roles are simply text files in your `~/.prompts/roles/` directory:

```bash
# Create a custom role
cat > ~/.prompts/roles/debugger.txt << 'EOF'
You are an expert debugging assistant. When analyzing code:
- Focus on identifying potential bugs and edge cases
- Suggest specific debugging strategies
- Explain the root cause of issues clearly
- Provide actionable fix recommendations
EOF

# Use your new role
aia --model gpt-4o=debugger analyze_bug.py
```

Discover available roles at any time:

```bash
aia --list-roles

# Output:
Available roles in /Users/you/.prompts/roles:
  architect    - Software architecture expert
  security     - Security analysis specialist
  performance  - Performance optimization expert
  debugger     - Expert debugging assistant
  optimist     - Positive perspective analyzer
  pessimist    - Critical risk analyzer
  realist      - Balanced pragmatic analyzer
```

## Track Performance: The --metrics Flag

When you're running multiple models, you need visibility into their token usage. The `--metrics` flag gives you detailed statistics after each response:

```bash
aia --model gpt-4o=architect,claude=security --metrics design_review.md
```

Output includes token counts for each model:

```
═══════════════════════════════════════════════════════════
Multi-Model Token Usage
───────────────────────────────────────────────────────────
Model                     Input     Output      Total
───────────────────────────────────────────────────────────
gpt-4o                     1,247      2,893      4,140
claude-3-sonnet            1,247      3,156      4,403
───────────────────────────────────────────────────────────
TOTAL                      2,494      6,049      8,543
═══════════════════════════════════════════════════════════
```

This visibility helps you:
- Understand which models generate more detailed responses
- Optimize your prompts to reduce token usage
- Monitor resource consumption across models
- Debug context window issues

## Control Costs: The --cost Flag

Token counts are useful, but what really matters is cost. The `--cost` flag adds pricing information to your metrics:

```bash
aia --model gpt-4o=architect,claude=security --cost design_review.md
```

Now you see the financial impact:

```
═══════════════════════════════════════════════════════════════════════════════
Multi-Model Token Usage
───────────────────────────────────────────────────────────────────────────────
Model                     Input     Output      Total         Cost       x1000
───────────────────────────────────────────────────────────────────────────────
gpt-4o                     1,247      2,893      4,140    $0.01784      $17.84
claude-3-sonnet            1,247      3,156      4,403    $0.01298      $12.98
───────────────────────────────────────────────────────────────────────────────
TOTAL                      2,494      6,049      8,543    $0.03082      $30.82
═══════════════════════════════════════════════════════════════════════════════
```

The breakdown shows:
- **Cost**: Actual cost for this request
- **x1000**: Projected cost if you ran this 1,000 times

This transparency empowers you to:
- Make informed decisions about model selection
- Budget for production workloads
- Compare cost vs. quality tradeoffs
- Optimize expensive prompts

## Synthesize Insights: The --consensus Flag

Multiple perspectives are powerful, but sometimes you need a unified answer. The `--consensus` flag uses the primary model (first in your list) to synthesize all responses into a cohesive recommendation:

```bash
aia --model gpt-4o=architect,claude=security,gemini=performance \
    --consensus architecture_decision.md
```

Instead of three separate responses, you get one comprehensive synthesis:

```
from: gpt-4o (consensus)
Based on the insights from our architecture, security, and performance experts,
here's a unified recommendation:

ARCHITECTURE APPROACH
The microservices architecture proposed is sound, with the caveat that we need
stronger service boundaries (security concern) and caching strategies
(performance concern)...

SECURITY CONSIDERATIONS
Implementing the zero-trust principles highlighted by our security analysis,
combined with the API gateway pattern...

PERFORMANCE OPTIMIZATION
The performance analysis reveals opportunities for early optimization through...

SYNTHESIS
We recommend proceeding with the microservices approach while incorporating
these critical modifications...
```

The consensus mode:
- Queries all models in parallel
- Collects their individual responses
- Uses the primary model to analyze and synthesize
- Resolves contradictions and highlights agreements
- Produces a unified, actionable recommendation

## Real-World Workflows

### Code Review with Multiple Perspectives

```bash
# Get architecture, security, and performance reviews
aia --model gpt-4o=architect,claude=security,gemini=performance \
    --metrics --cost \
    code_review src/payment_processor.rb

# Review output shows:
# - Architectural concerns
# - Security vulnerabilities
# - Performance bottlenecks
# - Token usage and costs for each analysis
```

### Decision Making with Balanced Viewpoints

```bash
# Evaluate a proposal from optimistic, pessimistic, and realistic angles
aia --model gpt-4o=optimist,gpt-4o=pessimist,gpt-4o=realist \
    --consensus \
    --metrics \
    evaluate_proposal proposal.md

# Get:
# - Three distinct perspectives on the same proposal
# - A synthesized recommendation balancing all viewpoints
# - Complete visibility into token usage and costs
```

### Iterative Design with Cost Tracking

```bash
# In chat mode, track accumulated costs across the conversation
aia --chat \
    --model gpt-4o=architect,claude=security \
    --cost \
    design_session

> How should we structure our authentication system?
[Both models respond with their perspectives]
[Metrics show cost: $0.0234]

> What about session management?
[Both models build on previous context]
[Metrics show cost: $0.0198, total session: $0.0432]

> Show me a code example
[Both models provide implementations]
[Metrics show cost: $0.0456, total session: $0.0888]
```

### Exploratory Analysis with Role Discovery

```bash
# First, see what roles are available
aia --list-roles

# Then compose your expert team
aia --model gpt-4o=data_scientist,claude=statistician,gemini=visualization \
    --consensus --cost \
    analyze_dataset sales_data.csv
```

## Configuration Flexibility

Roles can be configured multiple ways, with clear precedence:

### Command Line (Highest Priority)

```bash
aia --model gpt-4o=architect,claude=security my_prompt
```

### Environment Variables

```bash
export AIA_MODEL="gpt-4o=architect,claude=security,gemini=performance"
aia my_prompt
```

### Configuration File

```yaml
# ~/.aia/config.yml
model:
  - model: gpt-4o
    role: architect
  - model: claude-3-sonnet
    role: security
  - model: gemini-pro
    role: performance
```

### Mixing Approaches

```bash
# Config file specifies: gpt-4o with architect role
# Override on command line:
aia --model claude=security,gemini=performance my_prompt

# Result: Uses claude and gemini (CLI overrides config)
```

## Best Practices

### 1. Choose Complementary Roles

Combine roles that provide different angles:
- **Architecture + Security + Performance**: Comprehensive code review
- **Optimist + Pessimist + Realist**: Balanced decision making
- **Frontend + Backend + DevOps**: Full-stack system design
- **Data Scientist + Statistician + Business Analyst**: Data analysis

### 2. Use --cost to Optimize

Start with `--cost` to understand your spending:

```bash
# Test with multiple models
aia --model gpt-4o,claude-3-sonnet,claude-3-opus --cost test_prompt

# See that opus is 5x more expensive
# Decide if the quality difference justifies the cost
# Maybe use gpt-4o + claude-sonnet instead
```

### 3. Leverage --consensus for Complexity

Use individual responses for simple tasks, consensus for complex decisions:

```bash
# Simple: Compare individual perspectives
aia --model gpt-4o=expert1,claude=expert2 simple_question

# Complex: Synthesize into unified recommendation
aia --model gpt-4o=expert1,claude=expert2,gemini=expert3 \
    --consensus complex_decision
```

### 4. Track Metrics in Development

During prompt development, always use `--metrics`:

```bash
# See how changes affect token usage
aia --model gpt-4o --metrics my_prompt

# Refine prompt, test again
aia --model gpt-4o --metrics my_improved_prompt

# Compare token counts - did you reduce usage while maintaining quality?
```

### 5. Create Domain-Specific Roles

Build a library of specialized roles for your domain:

```bash
~/.prompts/roles/
  software/
    architect.txt
    security.txt
    performance.txt
    testing.txt
  business/
    analyst.txt
    strategist.txt
    finance.txt
  creative/
    copywriter.txt
    designer.txt
    editor.txt
```

Then compose expert teams:

```bash
aia --model gpt-4o=software/architect,claude=software/security \
    technical_design.md

aia --model gpt-4o=business/analyst,claude=business/strategist \
    --consensus market_strategy.md
```

## Performance Considerations

### Context Isolation

Each model instance maintains its own conversation context:

```bash
# These three models have completely separate conversation histories
aia --chat --model gpt-4o=optimist,gpt-4o=pessimist,gpt-4o=realist

You> Evaluate this risk
[Each model responds based only on its own previous messages]

You> What did the optimist say?
[Pessimist can't see optimist's messages - they're isolated]
```

This isolation ensures:
- No cross-contamination of perspectives
- Clean role adherence
- Predictable behavior
- Accurate cost tracking per model

### Concurrent Processing

All models run in parallel, not sequentially:

```bash
# These three models query simultaneously
aia --model gpt-4o=expert1,claude=expert2,gemini=expert3 my_prompt

# Total time ≈ slowest model, not sum of all models
```

### Cost vs. Quality Tradeoffs

Mix expensive and economical models strategically:

```bash
# Premium architecture analysis, economical additional perspectives
aia --model gpt-4o=architect,gpt-3.5-turbo=reviewer,claude-haiku=validator \
    --cost code_review.py

# See cost breakdown to optimize your expert team composition
```

## Validation and Error Handling

AIA validates roles at parse time with helpful feedback:

```bash
$ aia --model gpt-4o=nonexistent my_prompt

ERROR: Role file not found: ~/.prompts/roles/nonexistent.txt

Available roles:
  - architect
  - security
  - performance
  - debugger
  - optimist
  - pessimist
  - realist

# Immediately know what went wrong and what's available
```

## Migration from Traditional Multi-Model

If you're already using AIA's multi-model features, adding roles is seamless:

```bash
# Your existing workflow (still works perfectly)
aia --model gpt-4o,claude,gemini my_prompt

# Enhanced with roles (new capability)
aia --model gpt-4o=architect,claude=security,gemini=performance my_prompt

# Or mix and match
aia --model gpt-4o=architect,claude,gemini=performance my_prompt
```

All existing features continue to work:
- `--consensus` mode
- `--metrics` tracking
- `--cost` analysis
- Chat mode with `--chat`
- Pipeline processing with `--pipeline`

## Conclusion: The Future of AI Collaboration

AIA's multi-model role system represents a fundamental shift in how we interact with AI. Instead of treating AI as a monolithic oracle, we're assembling teams of specialized experts, each contributing their unique perspective to create comprehensive, nuanced solutions.

The addition of `--metrics` and `--cost` flags gives you unprecedented visibility into your AI operations, enabling data-driven optimization and confident scaling.

Whether you're:
- **Reviewing code** with architecture, security, and performance experts
- **Making decisions** with optimistic, pessimistic, and realistic advisors
- **Analyzing data** with statistician, data scientist, and business analyst perspectives
- **Designing systems** with frontend, backend, and DevOps specialists

AIA's multi-model role system empowers you to harness the collective intelligence of multiple AI models, each playing to their strengths while you maintain full visibility into performance and costs.

## Get Started Today

### Installation

```bash
gem install aia
```

### Create Your First Role

```bash
mkdir -p ~/.prompts/roles

cat > ~/.prompts/roles/architect.txt << 'EOF'
You are an expert software architect. When reviewing code or designs:
- Focus on system structure, patterns, and scalability
- Identify architectural anti-patterns
- Suggest improvements for maintainability
- Consider long-term technical debt implications
EOF
```

### Run Your First Multi-Model Role Session

```bash
# Create a simple test
echo "Review this approach: Using a monolithic database for a microservices architecture" > test.txt

# Get multiple expert perspectives with cost tracking
aia --model gpt-4o=architect,claude=security,gemini=performance \
    --cost \
    test.txt
```

### Explore the Documentation

- [Multi-Model Guide](https://madbomber.github.io/aia/guides/models#per-model-roles)
- [CLI Reference](https://madbomber.github.io/aia/cli-reference#-m-model---model-model)
- [Example Prompts](https://madbomber.github.io/aia/examples/)

---

**Ready to assemble your AI expert team?** Install AIA v0.9.20 today and discover the power of perspective.

**Questions? Feedback?** Join the discussion on [GitHub](https://github.com/madbomber/aia) or share your multi-model workflows with the community.

*AIA - Where the prompt is the code, and every perspective matters.*
