---
layout: blog_post
title: "The Trouble with Skills"
date: 2026-06-17
categories:
  - Engineering
permalink: /blog/engineering/the-trouble-with-skills/
tags:
  - Ruby
  - AI
  - Claude Code
  - LLM
  - Skills
  - Asgard
  - gem-skill
  - Tooling
---

# The Trouble with Skills

As software developers we all have skills of one kind or another that allow us to contribute to the overall workflow of creating something new. My skills may be different from your skills. They are in fact different from my robot's skills; yet strangely they are all the same in one way or another. One way that my human intelligence has in common with my robot's artificial intelligence is that we do not always have the right skill we need on hand at the time we need it.

That is the trouble with skills. Not that we lack them. That we cannot always have all of them available — in our heads, or in our context windows — at the same time.

So we both do the same thing. We externalize our skills: written down, organized, ready to be loaded when the moment calls for them. I have been thinking about this through two tools I recently released — `asgard`, a task runner for Ruby projects, and `gem-skill`, which generates AI skill files from gem documentation. They look like different solutions to different problems. The more I look at them side by side, the more they look like the same solution applied to the same gap — once for human intelligence, once for artificial intelligence.

---

## The Human Side: Skills You Have But Can't Always Use

Consider a procedure you know well. You have deployed this project dozens of times. You know you need to build before you test, and test before you release, and that lint can run alongside the build in parallel because neither depends on the other. This is not complicated knowledge. You have it.

But you haven't touched this project in two months. You sit down to cut a release, and the sequence doesn't come. Not because you lost the skill — the skill is there — but because the specific, ordered application of it in this context is not something your intelligence keeps at the surface. You go find the Makefile, or the README, or you ping the colleague who shipped last time. You piece it back together. You do the thing. Two months from now, you'll do it again.

This is not a failure of intelligence. It is a property of intelligence. Human intelligence maintains broad capability at the cost of procedural specificity. We are extraordinarily good at solving new problems and unreliable at executing known procedures from recall alone. We have known this about ourselves for as long as we have had engineering. It is why checklists exist. It is why runbooks exist. It is why the flight crew reads from a laminated card before every takeoff even though they have done it a thousand times.

Write the procedure down.

---

## Asgard and the .loki File

`asgard` is a Thor-based task runner for Ruby projects. Tasks are defined in `.loki` files — plain Ruby, reopening a `Tasks` class — with explicit dependency declarations. Asgard resolves the dependency graph, runs parallel groups concurrently, and executes everything in the right order.

```ruby
class Tasks
  desc "Compile the project"
  def build = sh "rake build"

  desc "Check code style"
  def lint = sh "bundle exec rubocop"

  depends_on [:lint, :build]
  desc "Run the test suite"
  def test = sh "bundle exec rake test"

  depends_on :test
  desc "Publish the gem"
  def release = sh "bundle exec rake release"
end
```

```bash
asgard release   # build ∥ lint → test → release
```

The procedure lives in the file, not in anyone's head. `asgard release` does the right things in the right order because the file says so — not because whoever is running it happens to remember. The skill is available on demand regardless of how long it has been since anyone used it.

Makefiles and Rakefiles have been doing this for decades. `asgard` extends the pattern with first-class dependency declarations, concurrent execution, and `.loki` auto-discovery from the current directory upward. But the idea is ancient: **a skill your team can execute reliably is a skill written down**.

And when you forget which skills are available? You just ask:

```bash
asgard help
```

Asgard prints every task with its description. You pick the one you need and run it. The skill is there. It was always there. You just needed a way to find it.

---

## The AI Side: Skills It Doesn't Have Yet

My robot — my AI coding assistant — has a version of this same problem, arriving from the opposite direction.

The robot does not forget procedures it once knew. It arrives at every conversation with the sum of its training: broad capability across languages, patterns, architectures, and domains. For well-covered territory, it is useful from the first message. It knows Ruby. It knows Rails. It can write idiomatic tests without being taught how.

What the robot does not have is the right skill for *your* specific context. It does not know the gem you wrote yourself. It does not know that a dependency released a breaking change last month, or that the version you are pinned to has a thread-safety quirk, or how your team structures initializers. That knowledge was never in its training data to begin with. The skill is absent, not forgotten.

Every session, it either infers what it can from the code in front of it, or it gets things wrong with confidence. You end up explaining the same gem twice, in separate conversations, with the explanation evaporating each time.

Same gap as the human case — the right skill not available when needed — different cause.

---

## SKILL.md and the Knowledge Brief

The SKILL.md convention addresses this directly. A SKILL.md is a structured markdown brief placed where AI coding tools will find and load it at session start: what this gem does, how to install it, the API you will actually use, the patterns that come up most often, the gotchas that will waste your afternoon.

The robot reads it before the first message. It arrives briefed. It does not have to infer the gem's API from incomplete training data. It has been told, in exactly the form it needs.

The parallel to the `.loki` file is direct:

| | Human Intelligence | Artificial Intelligence |
|---|---|---|
| **Skill gap** | Knows the steps, can't always recall the sequence | Knows general patterns, lacks your specific context |
| **Why it fails** | Can't hold every procedure in your head at once | Can't hold every gem's API in its context window |
| **The fix** | Write down the procedure | Write down the knowledge |
| **The file** | `.loki` | `SKILL.md` |
| **The tool** | `asgard` | Claude Code |
| **Global skills** | `~/*.loki` | `~/.claude/skills/` |
| **Project skills** | `project/*.loki` | `project/.claude/skills/` |
| **Discovery** | `asgard help` | CC skills list |

Same discipline. Same answer. Different intelligence, different gap, same solution.

The directory structure is not a coincidence — it reflects the same design decision made independently for each kind of intelligence. You keep a library of global skills that travel with you from project to project, and you keep project-specific skills that only apply in context. The human developer and the AI assistant both maintain that two-level hierarchy because both need it.

---

## gem-skill: Don't Burn Those Tokens Twice

Here is a scenario that will feel familiar if you work with an AI coding assistant.

You tell the robot to use the `xyzzy` gem in your project. The robot has never heard of `xyzzy` — or if it has, it wasn't paying close enough attention during training. So it runs off and finds what it can: scans the README at the surface level, picks up the obvious parts, and starts coding. Some of what it produces is good. Some of it is confidently wrong — hallucinated from a partial reading of documentation it never went deep enough into. You catch the bad code, correct the robot, explain how `xyzzy` actually works in the places it got wrong. It does better. You ship the project, everyone loves it.

Now you start a new project. You tell the robot to use `xyzzy` again.

*What is an xyzzy gem?* it says to itself, and runs off frantically to find out — reading the same documentation at the same surface level, making the same initial mistakes, waiting for the same corrections. You spend the same tokens you already spent last time teaching it the same things you already taught it.

The robot never retained what you taught it in the first project. Not because it is stupid, but because it has no mechanism for carrying that earned knowledge forward. Every project is a fresh start. Every gem it has learned the hard way, it will learn the hard way again.

This is the hole that `gem-skill` plugs.

`gem-skill` is a sub-command plugin for both the `gem` and `bundle` commands. It builds a global cache of SKILL.md files for the gem libraries you designate, one file per gem per version, stored in `~/.gem/skills`. When you use a gem in a new project, the skill file is already there. The robot loads it at session start and arrives knowing how `xyzzy` works — not from a frantic surface-level scan it is doing right now, but from a deep-read synthesis generated once and reused forever. It reaches for the right skill and produces good code from the first attempt.

```bash
gem install gem-skill
gem skill setup

# Generate a skill for any installed gem
gem skill install xyzzy

# Or generate skills for every gem in your Gemfile.lock at once
bundle skill install
```

The global cache means the work is done once and shared across every project on your machine. Two projects using different versions of the same gem each get the right skill. The tokens you spent teaching the robot the first time stay spent — you do not spend them again.

The `.loki` file is written by a human, for a human, executed by a machine. The SKILL.md is generated by a machine, for a machine, sourced from human documentation. The direction of authorship reverses. The discipline holds.

---

## The Right Skill, On Hand, When Needed

The trouble with skills — human or artificial — is not that we lack capability. It is that we cannot hold all of our capabilities available at once. The procedure slips out of the head. The gem's API is absent from the context window. The right skill is not there at the moment it is needed.

The answer in both cases is the same one engineers have always reached for: don't carry it in your head; put it in a file. Keep it somewhere you can find it, load it when you need it, and trust that it will be right when you do.

`asgard` and `.loki` do this for the procedures a developer needs to execute reliably. `gem-skill` and `SKILL.md` do this for the knowledge a robot needs to work accurately. Both human and artificial intelligence are out here building new things, and both are doing it with the same kind of external skill enhancement making it possible.

If your human intelligence needs a little help keeping track of your workflow tasks and skills, try out my `asgard` Ruby gem and start writing your own `.loki` files. If your AI keeps relearning the same gems from scratch on every project, try `gem-skill` and stop burning those tokens twice.

---

**Source:**
- [github.com/MadBomber/asgard](https://github.com/MadBomber/asgard)
- [github.com/MadBomber/gem-skill](https://github.com/MadBomber/gem-skill)

```bash
gem install asgard gem-skill && gem skill setup
```
