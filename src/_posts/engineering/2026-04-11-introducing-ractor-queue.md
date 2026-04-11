---
layout: blog_post
title: "Introducing ractor_queue: A Shared Queue for Ruby Ractors"
date: 2026-04-11
categories:
  - Engineering
permalink: /blog/engineering/introducing-ractor-queue/
tags:
  - Ruby
  - Concurrency
  - Ractors
  - Parallelism
  - Gems
---

# Introducing ractor_queue: A Shared Queue for Ruby Ractors

Ruby's Global VM Lock (GVL) — also called the GIL — has shaped how Ruby developers think about concurrency for decades. Threads share memory and run concurrently in I/O, but only one thread executes Ruby bytecode at a time. For CPU-bound work, adding threads does not add throughput.

Ruby 3.0 introduced **Ractors** as a first-class answer to this constraint. Each Ractor runs on its own OS thread and holds its own GVL, meaning two Ractors can execute Ruby code at the same time. On a 12-core machine, twelve Ractors can be doing real work simultaneously — no GVL contention.

The catch: Ractors enforce strict isolation. An object can only be accessed from one Ractor at a time unless it is *shareable*. Numbers, symbols, frozen strings, and objects explicitly frozen with `Ractor.make_shareable` qualify. Mutable objects — including Ruby's built-in `Queue` — do not.

This post introduces `ractor_queue` v0.1.0, a bounded, lock-free, Multi-Producer Multi-Consumer (MPMC) queue that is always `Ractor.shareable?`. It is the missing primitive for building Ractor-based pipelines, worker pools, and concurrent data processing in Ruby.

---

## The Problem: Ruby's Queue Cannot Cross Ractor Boundaries

The most natural tool for coordinating concurrent work in Ruby is `Queue`. It is thread-safe, it blocks cleanly, and it is familiar. But it is not Ractor-safe:

```ruby
q = Queue.new
Ractor.shareable?(q)  # => false
```

Attempting to pass a `Queue` as a shared reference to a Ractor raises `Ractor::IsolationError`. The reason is structural: `Queue` protects itself with a `Mutex`, and `Mutex` is not shareable across Ractor boundaries.

The alternative Ruby provides — sending objects *into* a Ractor via `Ractor#send` / `Ractor.receive` — is a point-to-point channel, not a shared queue. Multiple Ractors cannot read from or write to the same `Ractor` inbox simultaneously. It does not compose into a worker pool or a pipeline without additional coordination.

---

## RactorQueue: A Shared Queue That Works Across Ractors

`ractor_queue` solves this by replacing the mutex with lock-free atomics:

```ruby
require "ractor_queue"

q = RactorQueue.new(capacity: 1024)
Ractor.shareable?(q)  # => true
```

The same `q` reference can be passed to any number of Ractors. They all push and pop from the same queue simultaneously, without locks, and without any of them owning exclusive access to it.

Under the hood, `RactorQueue` wraps the [max0x7ba/atomic_queue](https://github.com/max0x7ba/atomic_queue) C++ library (MIT licensed, vendored — no external dependencies) via [Rice](https://github.com/jasonroelofs/rice) 4.x bindings. The C extension marks the type `RUBY_TYPED_FROZEN_SHAREABLE`, which lets `Ractor.make_shareable` freeze the Ruby wrapper without affecting the C++ buffer inside.

**Requirements:** MRI Ruby 3.2+, a C++17 compiler. The native extension builds automatically on `gem install`.

---

## The API

```ruby
# Create a bounded queue — capacity rounds up to the next power of two, minimum 4096
q = RactorQueue.new(capacity: 256)

# Non-blocking push: returns true if enqueued, false if the queue is full
q.try_push(42)      # => true
q.try_push(:hello)  # => true

# Non-blocking pop: returns the value, or RactorQueue::EMPTY if the queue is empty
q.try_pop           # => 42
q.try_pop           # => :hello
q.try_pop           # => RactorQueue::EMPTY

# EMPTY is a unique frozen object — nil is an unambiguous payload value
v = q.try_pop
process(v) unless v.equal?(RactorQueue::EMPTY)  # use equal?, never ==

# Blocking push and pop — spin until space or item is available
q.push(99)          # => self
q.pop               # => 99

# Blocking with timeout — raises RactorQueue::TimeoutError after 500 ms
q.pop(timeout: 0.5)

# State (approximate under concurrency)
q.size      # => Integer
q.empty?    # => true / false
q.full?     # => true / false
q.capacity  # => Integer (exact)
```

The `EMPTY` sentinel deserves a note: `try_pop` must distinguish between "the queue was empty" and "someone pushed `nil`". Using a separate frozen sentinel object for the empty-queue case means `nil` is a valid payload, and the two states are never confused. Always check with `equal?` (object identity), not `==`.

---

## Why Use Ractors?

Before diving into patterns, it is worth being concrete about when Ractors help.

**Ractors help when:** your workload is CPU-bound and can be decomposed into independent units. Image resizing, data transformation, parsing, computation — work that does not need shared mutable state.

**Ractors do not help when:** your workload is I/O-bound (threads already parallelize I/O under the GVL), or when your work is tightly coupled to shared mutable data structures that cannot easily be made shareable.

The Ractor model requires passing only shareable objects across Ractor boundaries. Integers, symbols, frozen strings, and objects frozen with `Ractor.make_shareable` qualify. Mutable arrays, hashes, and most Ruby objects do not — at least not without being deep-frozen first.

If your data fits those constraints, Ractors give you genuine parallelism on multi-core hardware.

---

## Patterns for Sophisticated Applications

### 1. Single Producer / Single Consumer (1P1C)

The baseline: one Ractor feeds work into a queue, another consumes it. A sentinel value signals end-of-stream.

```ruby
q = RactorQueue.new(capacity: 1024)

producer = Ractor.new(q) do |queue|
  100.times { |i| queue.push(i * i) }
  queue.push(:done)
end

consumer = Ractor.new(q) do |queue|
  results = []
  loop do
    v = queue.pop
    break if v == :done
    results << v
  end
  results
end

producer.value
puts consumer.value.inspect  # [0, 1, 4, 9, 16, ...]
```

The queue acts as a buffer — the producer can run ahead while the consumer processes, absorbing bursts without coordination.

### 2. Worker Pool (MPMC)

The most common real-world Ractor pattern: a shared job queue drained by N workers, results collected in a second queue.

```ruby
WORKERS = 8
jobs    = RactorQueue.new(capacity: 10_000)
results = RactorQueue.new(capacity: 10_000)

workers = WORKERS.times.map do
  Ractor.new(jobs, results) do |jq, rq|
    loop do
      job = jq.pop(timeout: 30)
      break if job == :stop
      rq.push(job * job)  # do work
    end
  end
end

1000.times { |i| jobs.push(i) }
WORKERS.times { jobs.push(:stop) }  # one sentinel per worker

results_list = 1000.times.map { results.pop }
workers.each(&:value)
```

Queue sizing matters here. With two chained bounded queues, a deadlock is possible: main blocks pushing to `jobs` (full), workers block pushing to `results` (full), main cannot drain `results` because it is blocked. The fix: size `jobs` to at least `job_count + worker_count`, and `results` to at least `job_count`, so neither producer ever blocks while the other queue is full.

### 3. Multi-Stage Pipeline

Ractors chained in stages, each transforming values and passing them downstream:

```ruby
raw    = RactorQueue.new(capacity: 64)
middle = RactorQueue.new(capacity: 64)

stage1 = Ractor.new(raw, middle) do |src, dst|
  loop do
    v = src.pop(timeout: 5)
    break if v == :done
    dst.push(v * 2)
  end
  dst.push(:done)
end

stage2 = Ractor.new(middle) do |src|
  output = []
  loop do
    v = src.pop(timeout: 5)
    break if v == :done
    output << v * 3
  end
  output
end

5.times { |i| raw.push(i + 1) }  # push 1..5
raw.push(:done)

stage1.value
puts stage2.value.inspect  # [6, 12, 18, 24, 30]
```

The intermediate queue decouples the two stages. If stage 2 is slower than stage 1, the intermediate queue absorbs the difference up to its capacity.

### 4. Queue Pool for High Ractor Counts

A single shared queue works well up to roughly `2 × CPU cores` Ractors doing pure queue operations. Beyond that, atomic CAS operations on the head and tail pointers start invalidating each other's cache lines across cores, and throughput levels off.

For higher Ractor counts, give each producer/consumer pair its own queue:

```ruby
PAIRS = 16  # 32 Ractors total

pairs = PAIRS.times.map do
  q = RactorQueue.new(capacity: 1024)
  p = Ractor.new(q) { |queue| 1000.times { |i| queue.push(i) } }
  c = Ractor.new(q) { |queue| 1000.times { queue.pop } }
  [p, c]
end

pairs.each { |p, c| p.value; c.value }
```

The trade-off: work is statically partitioned — each producer feeds only its paired consumer. For dynamic load balancing across many workers, use a small set of shared queues (e.g., 4 queues for 16 Ractors) with jobs chunked large enough that producers rarely block.

---

## Validating Shareable Payloads at the Push Site

When building a pipeline that feeds Ractors, non-shareable objects will cause `Ractor::IsolationError` at the Ractor boundary — which can be a confusing error to diagnose. The `validate_shareable: true` option moves that check to the push site:

```ruby
safe_q = RactorQueue.new(capacity: 64, validate_shareable: true)

safe_q.push(42)             # ok — Integer is shareable
safe_q.push("hello".freeze) # ok — frozen String is shareable
safe_q.push(:symbol)        # ok — Symbol is shareable

safe_q.push([1, 2, 3])      # raises RactorQueue::NotShareableError immediately
safe_q.push({ key: "value" })  # raises RactorQueue::NotShareableError immediately
```

The guard also fires inside a Ractor block, catching bad producers at the source regardless of where they run:

```ruby
bad_producer = Ractor.new(safe_q) do |queue|
  queue.push([4, 5, 6])
rescue RactorQueue::NotShareableError => err
  "caught: #{err.message}"
end

puts bad_producer.value
# => "caught: [4, 5, 6] is not Ractor-shareable"
```

This is off by default because the shareability check has a cost per push. Enable it during development and in code paths where producers are less controlled.

---

## Blocking Behavior and Interrupts

The blocking `push` and `pop` methods use a two-phase spin loop:

- **Phase 1** — The first 16 retries call `Thread.pass`. This yields to the scheduler cheaply and is fast when the queue clears quickly.
- **Phase 2** — Subsequent retries call `sleep(0.0001)` (100 µs). This suspends the OS thread rather than busy-waiting, preventing scheduler thrashing when many Ractors are blocked on the same queue.

Because each retry passes through Ruby's interrupt checking, `Thread#raise` and `Ctrl-C` can interrupt a blocked `push` or `pop` at any point.

`timeout: 0` means "try once; raise `TimeoutError` if not immediately successful." The operation is always attempted before the deadline check.

---

## Performance

Measured on Apple M2 Max (12 cores), Ruby 4.0.2:

| Configuration | Throughput |
|---|---|
| 1 producer / 1 consumer Ractor | ~470K ops/s |
| 2P / 2C shared queue | ~855K ops/s |
| 4P / 4C shared queue | ~1.25M ops/s |
| 8P / 8C shared queue | ~1.53M ops/s |
| 8P / 8C queue pool (8 queues) | ~1.66M ops/s |

Ruby's built-in `Queue` is not included — it cannot participate in Ractor benchmarks. Under MRI threads (no Ractors), `Queue` is faster than `RactorQueue` because the GVL makes lock-free atomics unnecessary overhead. `RactorQueue`'s advantage is exclusive to Ractor workloads where the GVL is not held.

---

## Installation

Add to your `Gemfile`:

```ruby
gem "ractor_queue"
```

Or install directly:

```sh
gem install ractor_queue
```

Requires MRI Ruby 3.2+ and a C++17 compiler (Clang on macOS, GCC on Linux). The native extension builds automatically on install.

---

## When to Use RactorQueue

`RactorQueue` solves one specific problem: coordinating work across Ractor boundaries with a shared, bounded queue. If your application is building a worker pool, a processing pipeline, or any pattern where multiple Ractors need to share a queue, this is the tool that makes it possible.

If you are working with threads rather than Ractors, Ruby's built-in `Queue` is the right choice — it is well-tested, widely understood, and faster under the GVL.

The gem is available at [github.com/madbomber/ractor_queue](https://github.com/madbomber/ractor_queue). Run `examples/01_basic_usage.rb` to see all the patterns in action, and `examples/02_performance.rb` to measure throughput on your hardware.
