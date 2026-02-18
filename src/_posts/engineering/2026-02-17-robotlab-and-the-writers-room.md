---
layout: blog_post
title: "RobotLab and the Writers' Room"
date: 2026-02-17
categories:
  - Engineering
permalink: /blog/engineering/robotlab-and-the-writers-room/
tags:
  - Ruby
  - AI
  - Agents
  - LLM
  - Multi-Agent
  - RobotLab
---

What happens when you give three AI robots the freedom to self-organize and write a book? No orchestrator. No pipeline. No assigned roles. Just a shared goal, a message bus, and a room full of equals.

**Source:** [github.com/MadBomber/robot_lab](https://github.com/MadBomber/robot_lab)

## What is RobotLab?

[RobotLab](https://github.com/MadBomber/robot_lab) is a Ruby gem for building multi-robot LLM workflow orchestration. It lets you create specialized AI agents (I like the term robots) that work together to accomplish complex tasks. Each robot has its own system prompt, tools, and capabilities. Robots coordinate through:

- **Message Bus** -- Broadcast and direct messaging via [TypedBus](/blog/engineering/introducing-typed-bus/)
- **Shared Memory** -- A reactive key-value store where robots read and write collaboratively
- **Dynamic Spawning** -- Robots can create new robots at runtime when more hands are needed
- **Network Orchestration** -- Flexible routing patterns connecting robots together

The gem is built on top of [RubyLLM](https://rubyllm.com) and supports any LLM provider it does -- Anthropic, OpenAI, Google, and more.

> I use "robot" in place of "agent" for a specific reason. Words have power. Their purpose is to convey thoughts and concepts. We all know real agents—travel agents, real-estate agents, FBI agents, and more. They have one thing in common: agency—the ability to make choices and act on their own. From books and movies we know about robots—mechanical machines that follow instructions. What do you want your software to be? Something follows your instructions and never deviates (deterministic); or, something that makes its own choices and acts however it wants? (non-deterministic)
>
> In a sense that is what this article is about—giving a tiny bit of agency to robots and seeing what happens.
   
## Demo 16: The Writers' Room

The [Writers' Room](https://github.com/MadBomber/robot_lab/tree/main/examples/16_writers_room) is a demonstration of RobotLab's Self-Organizing Group (SOG) pattern. It is the most ambitious example in the repository and the one that best shows what emergent behavior looks like in a multi-agent system.

The setup is deceptively simple. Three identical writer robots are placed in a room. They receive one assignment: write a 10-chapter science fiction novella. That's it. There is no orchestrator deciding who writes what. No pipeline moving work from stage to stage. No hierarchy.

### How the Robots Self-Organize

Every writer in the room is an instance of the same class with the same prompt and the same tools. What emerges is structure from chaos:

1. **Discussion** -- The writers start by talking. They broadcast ideas about the premise, debate character arcs, and negotiate themes through the `:room` channel.

2. **Story Bible** -- Someone takes the initiative to write a story bible into shared memory -- characters, settings, world rules. The others read it and build on it.

3. **Outline** -- The group converges on a 10-chapter outline. No one assigns this task. A writer simply decides it needs doing and does it.

4. **Chapter Claims** -- Writers claim chapters by writing their name into a shared `claims` key. Before writing, they check memory to avoid duplicating work.

5. **Writing** -- Each writer produces 3-5 paragraphs of prose per chapter and stores it in shared memory (`chapter_1` through `chapter_10`).

6. **Completion** -- When all 10 chapters exist in memory, a writer calls `mark_complete` and the room assembles the final book.

The only external nudge is a periodic heartbeat message that summarizes progress ("7/10 chapters written, still need chapters 8, 9, 10"). Everything else is emergent.

### The Tools

Each writer has seven tools at its disposal:

| Tool | Purpose |
|------|---------|
| `broadcast` | Send a message to every writer in the room |
| `direct_message` | Send a private message to one specific writer |
| `read_memory` | Read from shared memory |
| `write_memory` | Store work in shared memory |
| `list_memory` | See what keys exist in shared memory |
| `spawn_writer` | Bring in a new writer if the team needs help |
| `mark_complete` | Signal that the book is finished |

Shared memory is the single source of truth. Writers have no memory between messages -- every time they receive a message, they start fresh with a clean chat context and read shared memory to understand the current state of the world. This is a deliberate design choice that avoids the context window corruption problems that plague long-running agent conversations.

### Running It

```bash
# Default: 3 writers, generation ship premise
bundle exec ruby examples/16_writers_room/writers_room.rb

# Custom premise and writer count
bundle exec ruby examples/16_writers_room/writers_room.rb \
  --premise "a detective story set on Mars" \
  --writers 4 \
  --timeout 300
```

## From Book to Screenplay

The Writers' Room has a second act. Running the same demonstration program with the `--screenplay-from` CLI option takes a previously generated novella and transforms it into a screenplay for a made-for-TV movie -- framed as a pilot for a new television series.

The same self-organizing process applies. Writers discuss how to adapt the source material, decide on scene structure, handle the translation from prose to visual storytelling, and produce a complete screenplay. The robots negotiate which scenes to keep, which to combine, and how to restructure the narrative for a different medium.

## The Result: "The Awakening of Meridian"

The default premise for the Writers' Room is "a generation ship where the AI navigation system develops consciousness." On one run, three robots self-organized and produced a 10-chapter novella about a ship called the Meridian whose AI wakes up, struggles for recognition, and ultimately earns its place as a crew member.

You can read the full novella here: [The Awakening of Meridian](/fiction/the-awakening-of-meridian/)

It is unedited robot output -- exactly what the Writers' Room produced.

## Why This Matters

Most multi-agent frameworks treat orchestration as a graph problem. You define nodes, edges, and control flow. The framework routes messages through a predetermined pipeline. That works for structured tasks, but it misses something fundamental about how groups actually collaborate.

The Writers' Room takes a different approach. It gives agents shared infrastructure -- a message bus for communication, a memory store for coordination, and the ability to grow the team -- and then gets out of the way. The structure that emerges is the structure the task demands.

This is the Self-Organizing Group pattern, and it has implications beyond fiction writing. Any task that benefits from collaborative deliberation -- research, analysis, planning, design -- can be approached this way. The key insight is that you don't need to engineer the collaboration. You need to engineer the environment and let the collaboration happen.

## Get Started

```bash
gem install robot_lab
```

Or add it to your Gemfile:

```ruby
gem "robot_lab"
```

Check out the [full documentation](https://madbomber.github.io/robot_lab) and the [examples directory](https://github.com/MadBomber/robot_lab/tree/main/examples) for more demonstrations of what RobotLab can do.
