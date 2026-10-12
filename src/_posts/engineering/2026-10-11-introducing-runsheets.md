---
layout: blog_post
title: "Runsheets: Runbooks That Keep a Record of Themselves"
date: 2026-10-11
categories:
  - Engineering
permalink: /blog/engineering/introducing-runsheets/
tags:
  - Ruby
  - DevOps
  - SRE
  - Runbooks
  - Gems
---

# Runsheets: Runbooks That Keep a Record of Themselves

I should say up front that runbooks are not my usual territory. I'm a Ruby developer who has spent most of his time on libraries, frameworks and AI tooling. The people who live in runbooks are SREs and DevOps engineers, and they will probably spot where I've misunderstood their world. I'd like to hear about it. More on that at the end.

Here is what I did to get started: I read what the practitioners say about runbooks, then I built a small tool around the gap they keep describing.

## What a runbook is

A runbook is a step-by-step guide for carrying out a task in a system. On-call engineers use them during incidents. Platform teams use them for risky procedures like failovers, teardowns and migrations. Anyone with a monthly chore (certificate rotation, disk triage, database maintenance) uses one for work done too rarely to remember.

Some sources separate runbooks from playbooks. A runbook covers a known, repeatable procedure. A playbook covers situations that need investigation and judgment. The usage isn't consistent. Google's SRE books call the per-alert guide a playbook, the reverse of that split, so check how your team uses the words.

The advice that repeats across the sources I read:

- **Write for 3 AM.** Whoever runs it is tired and stressed. Be clear, be actionable.
- **Link them from alerts.** An alert that fires without a pointer to its runbook wastes the first ten minutes.
- **Treat them like code.** Version them, review them, and have someone actually run them on a schedule to see whether they still work.
- **Collect feedback after every use.** Rootly suggests treating every incident as a freshness test for the runbook you used.
- **Automate selectively.** Start with stable, low-risk steps.

Most of that material comes from vendors, who sell runbook automation, so I read it with some salt. The overlap between sources is still useful.

## The gap

Runbooks tend to fail in a predictable way. The database is filling up at 2 a.m. The on-call engineer finds the runbook on the wiki, last edited eleven months ago, and starts pasting commands into a terminal. Step 3 prints something that doesn't match the example. Is that expected? They carry on. An hour later the incident is closed, and the only evidence of what was run is terminal scrollback that is already gone.

Next month someone does it again, and nobody knows whether the runbook still works until they're halfway through.

The practitioners describe two ways out, and they pull in opposite directions.

**Make the runbook executable.** Tines says the runbook stops describing the response and becomes the response. Fully automated runbooks cut execution time and human error, at the cost of more upfront work and maintenance.

**Keep the human in the loop.** Antimetal argues that the reader's advantage is noticing when reality diverges from the document. A script doesn't notice. It recommends writing the runbook, using it across several real incidents, and only then automating. Automating a procedure that has never met a real failure is how automation makes incidents worse. A stale runbook is also worse than none, because it sends someone confidently down a path that no longer applies.

Both camps are right, and a wiki page and a shell script each fail one of them. The wiki explains the *why* and lets you stop between steps, but it records nothing and the commands are copy-and-paste. The script runs exactly as written, but it hides its reasoning, won't stop for a human decision, and leaves no record unless you write the logging yourself.

## What runsheets does

[runsheets](https://github.com/MadBomber/runsheets) sits between the two. A runbook stays plain markdown: a directory of files, or one file whose `##` headings are the steps. The tool serves it as a local web page at `127.0.0.1:4567`. The commands the author marked as runnable get a Run button. The operator still reads each step and decides when to click.

The vocabulary is small. The document is the *runbook*. The record of one run of it is the *runsheet*. The web page is the vehicle, and the record is the point.

```bash
gem install runsheets          # Ruby 3.4 or newer
runsheets --open path/to/runbooks
```

### Opting in through the fence

The author chooses what is runnable by adding a word after the language on a fenced block. A block without a flag is only text.

| Info string | Behavior |
| --- | --- |
| `bash` | Display only. |
| `bash run` | Run button. Stdout, stderr, exit status and timing are recorded. |
| `bash destructive` | Run button behind a confirmation code the operator must type. |
| `bash background` | Start and Stop buttons, for tunnels and tails. Output streams into the page. |
| `bash terminal` | No Run button. "Run this in your own terminal, then confirm." An **I ran this** button records it. |
| `text expect` | Not executed. Compared with the output of the block above it. |

The `expect` block is the part I find most useful. Put it under a command and runsheets compares the real output with it, using `{{any}}` for the parts that change. A mismatch shows up as a diff next to the output. That is the "step 3 printed something odd, was that expected?" question answered by the tool, not by whoever is tired enough to be reading it.

A step looks like this:

````markdown
---
title: Check free space
---

Confirm the volume is actually the problem before deleting anything.

```bash run
df -h "$TARGET_DIR"
```

```text expect
Filesystem {{any}} Use% Mounted on
```
````

Front matter at the top of `runbook.md` declares inputs, which become a form when a run starts. Values reach each block as environment variables, so `$TARGET_DIR` works in the browser and when pasted into a terminal. A `secret: true` input is masked in the form and never written to the record.

### The runsheet

Every execution writes down the exact command, its output, exit status and timing. Manual steps record who acknowledged them and any note. The layout on disk:

```text
~/.local/share/runsheets/runs/
  <runbook-slug>/<session-id>/
    run.json        steps, blocks, timestamps, exit codes, acknowledgements
    run.md          the same as a readable transcript
    blocks/
      020-stop-the-pipeline-1.1.cmd   the exact code that ran
      020-stop-the-pipeline-1.1.out   its stdout and stderr
```

The records live outside the runbook directory, so captured output never lands in your docs repository. A `session.log` is appended as things happen and echoed to the terminal, in a format you can grep. "Show me what was run during the change window" becomes a file you can send an auditor.

Open an old run later and any block that has changed or been removed since then is flagged, with a diff against the code that actually ran. That speaks to the staleness problem. It doesn't prevent it, but it makes drift visible.

### Order is not enforced

A run is a record executions are written to, not a sequence you must follow. You can open any step, in any order, and run just that. During an incident the right next move is often not the next numbered step. The tool doesn't know better than the engineer, so it doesn't pretend to.

### From the terminal

Not every operator wants a browser. `runsheets --run STEP path/to/runbook` runs one step at the terminal and records it the same way. A destructive block still needs its code typed, and a terminal block still asks for confirmation. It exits 0 on success, 1 on failure and 130 on Ctrl-C, so it fits into other scripts. `runsheets --run verify` runs a runbook's `verify.md`, which makes it a health check.

Two more helpers: `runsheets --check` lints a runbook for authoring problems (an unknown flag, a `run` on a language that can't execute), and `runsheets --new` asks a few questions and writes a runbook from a template.

## Because it runs commands

A tool that executes shell commands from a web page needs careful defaults. These are the ones I settled on:

- It binds to loopback and runs as you, with your shell environment, SSO sessions and tunnels. There is no server to deploy and no shared credentials to manage. There is also no multi-user story, and it isn't meant to have one.
- Only blocks the author flagged can run. Everything else is inert.
- Every request needs a session key from the link runsheets prints, and every state-changing request needs a per-process token and a loopback `Host` header. A page on another origin can't drive it.
- A Content-Security-Policy lets only the page's own script run. Raw HTML in a runbook renders, but its scripts do nothing.
- Destructive blocks show the blast radius from the front matter, and the confirmation code is issued and checked on the server.
- Captured output is redacted for secret values before it is written. That is plain string replacement, so an encoded secret is not caught. I'd sooner tell you than have you find out.

Only one class, `Executor`, is allowed to spawn processes. The architecture spec (`Archspec.rb`) forbids `spawn`, `system` and `popen` in every other layer, so each execution goes through the same path that records and redacts it.

## What it pairs with

A runbook block should be readable at a glance. When a step needs a parallel health check or a cleanup with a dozen guard clauses, the code can live in an [asgard](/blog/engineering/introducing-asgard/) task file beside the runbook, and the block becomes one line:

```bash run
asgard health
```

The runbook explains why. The task file holds the code. The runsheet records that it ran.

## What it isn't

It is not an incident management platform, and it doesn't page anyone. It doesn't run unattended, and by design it can't. If you want fully automated remediation, tools like Tines and Rootly are built for that. runsheets is for the cases where you want a person making each call with an accurate record of what happened.

It is also a proof of concept. File formats and the CLI may change without notice. The version is 0.0.x for a reason.

## Help me get this right

I wrote the tool from reading and reasoning, not from years on a pager. If you run runbooks every day, I want to know where the model is wrong: the vocabulary, the block conventions, the things an incident responder would never tolerate in a UI. Files, a rough runbook of your own, or a blunt paragraph are all useful.

- Code and issues: <https://github.com/madbomber/runsheets>
- Documentation: <https://madbomber.github.io/runsheets>
- Install: `gem install runsheets`

Try the bundled `hello` example first. It uses every block kind and touches nothing on your machine.

## Sources

The runbook background in this post draws on these:

- [Harness: how to build runbooks that work](https://www.harness.io/blog/how-to-build-runbooks-that-work----and-automate-them-with-harness-ai-sre)
- [Blameless: Runbook automation best practices](https://www.blameless.com/blog/runbook-automation-best-practices)
- [SolarWinds: Runbook automation](https://www.solarwinds.com/sre-best-practices/runbook-automation)
- [Tines: What are runbooks, and how to automate them](https://www.tines.com/blog/what-are-runbooks-and-how-to-automate-them/)
- [Rootly: What is a runbook](https://rootly.com/blog/what-is-a-runbook)
- [Cortex: Runbooks vs playbooks](https://www.cortex.io/post/runbooks-vs-playbooks)
- [Antimetal: Runbook glossary](https://antimetal.com/glossary/runbook)
- [iSDown: What is a runbook in DevOps](https://isdown.app/blog/runbook-in-devops)
