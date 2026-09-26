---
layout: blog_post
title: "Introducing Asgard: a Thor-Based Task Runner"
date: 2026-09-26
categories:
  - Engineering
permalink: /blog/engineering/introducing-asgard/
tags:
  - Ruby
  - Gems
  - Tooling
  - Thor
  - CLI
  - Task Runner
---

# Introducing Asgard: a Thor-based task runner where tasks live in `.loki` files

Asgard 0.4.0 was released on September 26, 2026. It is a Ruby task runner: define tasks as methods in a `.loki` file, declare what each task depends on, and run them with `asgard <task>`. The command line is handled by [Thor](https://github.com/rails/thor), so subcommands, typed options, argument validation, and generated help are all available without extra code.

The part I'd point to first is how dependencies are declared. One `depends_on` line says which prerequisites run one after another, which run at the same time, and in what order those groups happen. Serial, concurrent, or a mix of both, all in the same line, with no separate job-count flag or special task type.

This post covers what Asgard does, how a `.loki` file is put together, and what shipped in 0.4.0, including built-in scheduled tasks. Full documentation is at [madbomber.github.io/asgard](https://madbomber.github.io/asgard/).

About the name: Thor handles the CLI, Asgard is where the tasks live, and Loki (the `.loki` file) holds the tricks.

## Why another task runner

I wanted three things together that I kept assembling by hand:

1. **Thor's CLI.** Rake's argument syntax (`rake task[a,b]`) is awkward for anything past a single parameter. Thor gives each task real options, defaults, enums, and help text.
2. **Dependencies that mix serial and concurrent steps.** Thor has no dependencies at all. Rake has prerequisites, but concurrency is all or nothing: a `multitask` runs every one of its prerequisites in parallel. Make parallelizes through the global `-j` flag. I wanted to say "set up first, then lint, build, and typecheck at the same time, then test" in one line, next to the task it belongs to.
3. **Plain Ruby.** A `.loki` file is a Ruby file. There is no separate language to learn and nothing is off limits: `require`, conditionals, helper methods, class variables all work.

If your tasks take no arguments and never need to overlap, Rake already does the job. Asgard targets projects where tasks take options, where some can run concurrently, and where the task list spans several files.

## A first `.loki` file

Asgard walks up from the current directory looking for a `.loki` file. That file marks the project root and is loaded as Ruby. Tasks are instance methods on a pre-defined `Tasks` class, which the file reopens:

```ruby
# .loki
class Tasks
  desc "Say hello"
  def hello = puts "Hello, World!"

  desc "greet NAME", "Greet NAME"
  method_option :shout, aliases: "-s", type: :boolean, desc: "Uppercase the output"
  def greet(name = "World")
    message = "Hello, #{name}!"
    puts options[:shout] ? message.upcase : message
  end
end
```

```bash
asgard hello
asgard greet Alice --shout
asgard help greet
```

Everything above is standard Thor; [Tasks](https://madbomber.github.io/asgard/tasks/) and [Options](https://madbomber.github.io/asgard/options/) in the docs cover the full set. `desc` also accepts a single argument (the usage string defaults to the method name). Thor resolves unambiguous prefixes, so `asgard gr` runs `greet`.

## Serial, concurrent, or both, in one line

This is the feature that sets Asgard apart. `depends_on` goes directly above the method it applies to, and its arguments are an execution plan read left to right:

- A **bare symbol** is a stage by itself. Stages run one after another.
- An **array** is a stage whose members all run at the same time, each in its own Ruby thread. The next stage starts only after every member has finished.
- **Mixing** the two in one call gives any combination of serial and concurrent steps.

![Sequential, parallel, and mixed depends_on stages](/blog/images/asgard-depends-on-stages.svg)

Here is the mixed form on a CI pipeline:

```ruby
class Tasks
  desc "Install dependencies"; def setup     = sh "bundle install"
  desc "Check code style";     def lint      = sh "bundle exec rubocop"
  desc "Compile assets";       def build     = sh "rake assets:precompile"
  desc "Run the type checker"; def typecheck = sh "bundle exec srb tc"
  desc "Run tests";            def test      = sh "bundle exec rake test"

  # setup, then lint + build + typecheck together, then test
  depends_on :setup, [:lint, :build, :typecheck], :test
  desc "Full CI pipeline"
  def ci = puts "CI complete"
end
```

Moving a step between serial and concurrent is an edit to brackets. The tasks themselves don't change, and neither does the command used to run them. There is no `-j` flag, and no special parallel task type to switch to.

To measure the difference, I replaced each of the five steps with `sleep 1` and ran two versions of the pipeline:

```ruby
depends_on :setup, :lint, :build, :typecheck, :test      # all serial
def ci_serial = puts "done"

depends_on :setup, [:lint, :build, :typecheck], :test    # middle stage concurrent
def ci = puts "done"
```

```
$ time asgard ci_serial     # real 5.30
$ time asgard ci            # real 3.27
```

That works out to three stages instead of five, and about three seconds instead of five, including Ruby's startup time.

Each dependency runs at most once per invocation, even when several tasks, or several threads in the same parallel group, share it. A thread that reaches a dependency already in progress waits for it to finish rather than starting it a second time. That tracking applies only to `depends_on`: calling another task as a plain method inside a task body runs it again, every time.

The dependency graph is validated before any task runs. A cycle, a dependency name that doesn't exist, a dependency that requires arguments, or a `depends_on` with no method after it all produce a one-line error and exit 1 rather than failing partway through a run. Cycle detection uses the standard library's `TSort`; Asgard has no graph-library dependency. [Dependencies](https://madbomber.github.io/asgard/dependencies/) covers deduplication, transitive dependencies, and `depends_on` inside subcommands.

### Dependencies decided at load time

When the list can't be written down ahead of time, pass a block (or a lambda). It is evaluated once, after every `.loki` file has loaded:

```ruby
depends_on { [all_commands.keys.grep(/_check\z/).map(&:to_sym)] }
desc "Run every quality gate in parallel"
def quality = puts "done"
```

This is how Asgard's own `quality` task works: every task named `*_check` runs in one parallel group, including checks from files that are imported conditionally. Adding a gate means defining a task with the right suffix; `quality` itself never changes. The block's return value is shape-checked (an array of stages, each a symbol or an array of symbols), and a malformed result raises an error naming the task. See [Dynamic Dependencies](https://madbomber.github.io/asgard/dependencies/#dynamic-dependencies-proc-block-form).

### Reading results from parallel tasks

Parallel dependencies run in separate threads, so writing results to instance variables on a shared object is a race. Asgard collects each dependency's return value instead and hands the collection to the dependent task:

```ruby
desc "Run the test suite"
def test_check = system("bundle exec rake test") ? :pass : :fail

desc "Run RuboCop"
def rubocop_check = system("bundle exec rubocop") ? :pass : :fail

depends_on [:test_check, :rubocop_check]
desc "Summarize"
def quality
  dep_results.each { |name, status| puts "#{name}: #{status}" }
end
```

A task invoked directly that returns `:fail` makes `asgard` exit with status 1, so `asgard test_check` works as a CI step.

## Shell helpers

`sh` runs a command and exits with its status if it fails. A single line goes to `system`; a multi-line heredoc goes through `bash -c`:

```ruby
desc "Bootstrap the development environment"
def setup
  sh <<~SHELL
    brew install redis
    brew services start redis
    bundle install
  SHELL
end
```

For a task whose last step is a long-running process (a dev server, a REPL), `sh ..., exec: true` replaces the Asgard process with the command. Nothing stays resident behind it, and Ctrl-C goes straight to the command:

```ruby
desc "Serve the docs locally"
def doc_server = sh "mkdocs serve", exec: true
```

See [Handing Off with exec](https://madbomber.github.io/asgard/shell/#handing-off-with-exec).

`shebang` writes a script to a tempfile and runs it with the named interpreter (`:python3`, `:node`, `:ruby`, `:perl`, `:bash`, `:sh`, or any other executable):

```ruby
desc "Summarize results.json"
def analyze
  shebang :python3, <<~PYTHON
    import json
    data = json.load(open("results.json"))
    print(f"Total: {sum(data.values())}")
  PYTHON
end
```

[Shell Helpers](https://madbomber.github.io/asgard/shell/) lists the supported interpreters and the `silent:` option.

## Splitting tasks across files

Only `.loki` is loaded automatically. It decides what else to load with `import`, which takes a path or glob, resolves relative to the calling file, and is idempotent:

```ruby
# .loki
import "*.loki"
import "quality_rails.loki" if ENV["RAILS_ROOT"]

class Tasks
  @@project ||= "myapp".freeze
end
```

Each imported file reopens `class Tasks`. Shared settings go in class variables (`@@name ||= ...`), which are visible in every task and in subcommand classes. `import_up "name.loki"` finds a file in an ancestor directory and loads it, which lets a subproject pull in tasks from a parent workspace. `loki_up(".env")` returns the path to any file found by walking upward. See [Task Files](https://madbomber.github.io/asgard/task-files/) and [Variables](https://madbomber.github.io/asgard/variables/).

A few other small conveniences:

- [`env(:port, "3000")`](https://madbomber.github.io/asgard/environment/) reads `PORT`, with an optional default, and raises `KeyError` when the variable is missing and no default is given.
- `dotenv` loads a `.env` file.
- `header` and `footer` add lines above and below the command list in `asgard help`.
- [`helper(:version) { ... }`](https://madbomber.github.io/asgard/helpers/) defines a method callable both at class level (for example inside `header`) and inside task bodies.
- Subcommands are Thor subcommands: subclass `Tasks`, then register the class with `subcommand "db", DBCommands`. See [Subcommands](https://madbomber.github.io/asgard/subcommands/).

## `asgard --doctor`

Once tasks span several files, one question comes up again and again: which file did a task come from, and did a later file silently redefine it? `asgard --doctor` is handled before Asgard's normal startup, so it still produces a report when a `.loki` file is broken or the dependency graph has a cycle, the cases that would otherwise stop `asgard` with an error. It reports which `.loki` marker was used, which markers higher up are shadowed, what each `import` resolved to, and every task grouped by file as `path:line`. A task defined twice is marked at both locations, one as `OVERRIDDEN ... never callable` and the other as `active — redefines ...`. See [Asgard::Doctor](https://madbomber.github.io/asgard/api/#asgarddoctor) in the API reference.

## New in 0.4.0: scheduled tasks

Any task can now run on a schedule under the operating system's own scheduler: launchd on macOS, systemd user timers on Linux. Asgard runs no daemon of its own. Declare the schedules in `.loki`:

```ruby
class Tasks
  schedule :daily_summary, at: "17:30", on: :weekdays
  schedule :backup,        at: %w[02:00 14:00]           # on: defaults to :daily
  schedule :sync,          every: 3600                   # seconds
  schedule :report, options: "--period week", at: "16:00", on: :friday
end
```

`at:` takes wall-clock times, and `on:` takes `:daily`, `:weekdays`, `:weekends`, a day name, or an array of days. `every:` takes an interval. A plain integer is a number of seconds. Anything that responds to `in_seconds` also works, which includes ActiveSupport durations. Asgard doesn't depend on ActiveSupport, so require the core extension at the top of `.loki` to write intervals in units:

```ruby
require "active_support/core_ext/integer/time"

class Tasks
  schedule :heartbeat,   every: 45.seconds
  schedule :sync,        every: 30.minutes
  schedule :rotate_logs, every: 6.hours
  schedule :backup,      every: 1.day
  schedule :prune,       every: 2.weeks
end
```

Then manage the entries:

```bash
asgard schedule preview        # show the job files install would write
asgard schedule install        # load declared entries, drop undeclared ones
asgard schedule list           # installed entries, state, last exit status
asgard schedule stop NAME      # stays stopped across reboots and reinstalls
asgard schedule start NAME
asgard schedule trigger NAME   # run it now
asgard schedule log NAME -f    # follow its log
asgard schedule remove         # remove all of this project's entries
```

Each job runs `asgard <task> [options]` from the project root with the `PATH` captured at install time. If the project has a `.envrc`, it is loaded at run time through `direnv exec`. Calendar runs missed while the machine slept fire on wake. When `launchctl` or `systemctl` fails, Asgard reports a one-line `Asgard::Schedule::Error` instead of a backtrace.

This started as a standalone `dev/schedule.loki` in my own projects. If you used that file, remove its `import_up "dev/schedule.loki"` line: it overrides the built-in `schedule` and records declarations where `asgard schedule` never looks. Job labels and file paths are unchanged, so entries that file installed are still recognized. That file required ActiveSupport; the built-in version does not. [Scheduled Tasks](https://madbomber.github.io/asgard/schedule/) documents every keyword, how entries are named, and where the job files and logs live.

The 0.4.0 release also fixes a bug where `asgard <task>` always exited 0 even when the task returned `:fail`. Individual quality gates run from CI or from a cross-repository runner now report failure correctly.

## Getting started

```bash
gem install asgard
# or
bundle add asgard
```

Requirements: Ruby 3.2 or newer. Runtime dependencies are `thor` (~> 1.0) and `dotenv` (~> 3.0). Scheduling needs launchd or systemd user sessions; `direnv` is optional.

Create a `.loki` file in your project root, add a task, and run `asgard help`. [Getting Started](https://madbomber.github.io/asgard/getting-started/) walks through the first file, and [Examples](https://madbomber.github.io/asgard/examples/) describes each of the example files. The repository's `examples/` directory has working files for every feature above, including subcommands, concurrent workers, and a deliberately racy example that shows what `dep_results` is for.

Asgard is at version 0.x and its API is still moving. Two breaking changes have already happened: the `var` DSL was dropped in favor of class variables, and automatic loading of sibling `*.loki` files was replaced by explicit `import`. The [CHANGELOG](https://github.com/MadBomber/asgard/blob/main/CHANGELOG.md) records each one with a migration note. The suite has 216 tests and enforces 95% line coverage, and the gem runs its own RuboCop, Flog, Flay, Reek, bundler-audit, and typos gates through its own `.loki`.

## How I use it

Every repository in my workspace has a `.loki`. The asgard repository's own file is a fair example: `asgard` with no arguments runs `quality`, which runs every `*_check` gate in parallel and prints a pass/fail table. `asgard release` prompts before tagging and pushing, and `asgard doc_server` hands the terminal to `mkdocs serve`. The scheduling feature came out of wanting a nightly summary task on my Mac without writing plist files by hand.

## Resources

- Source: https://github.com/MadBomber/asgard
- Documentation: https://madbomber.github.io/asgard/
- Scheduled tasks: https://madbomber.github.io/asgard/schedule/
- Changelog: https://github.com/MadBomber/asgard/blob/main/CHANGELOG.md
- Issues and feedback: https://github.com/MadBomber/asgard/issues
