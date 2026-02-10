---
layout: blog_post
title: "Introducing TypedBus: Async Pub/Sub with Typed Channels for Ruby"
date: 2026-02-07
categories:
  - Engineering
permalink: /blog/engineering/introducing-typed-bus/
tags:
  - Ruby
  - Async
  - Pub/Sub
  - Concurrency
  - Gems
---

![TypedBus](/blog/images/typed_bus.png)

I've been working on a new Ruby gem and I'm happy to share the first release: **TypedBus**.

TypedBus is a lightweight, fiber-based pub/sub message bus for Ruby. It gives you named channels with optional type enforcement, explicit ACK/NACK delivery semantics, dead letter queues, backpressure, and adaptive throttling -- all running inside a single [Async](https://github.com/socketry/async) reactor. No threads. No mutexes. Just fibers because we don't get enough fiber in our diets.

**Source:** [github.com/MadBomber/typed_bus](https://github.com/MadBomber/typed_bus) | **Docs:** [madbomber.github.io/typed_bus](https://madbomber.github.io/typed_bus)

## Why TypedBus?

Ruby has plenty of background job libraries, but in-process pub/sub with delivery guarantees is a different niche. I wanted something that could wire together concurrent pipeline stages within a single process while giving me:

- **Confidence that messages were handled** -- subscribers must explicitly `ack!` or `nack!` each delivery, with auto-nack on timeout
- **Visibility into failures** -- every nacked or timed-out delivery lands in a dead letter queue
- **Flow control** -- bounded backpressure and adaptive throttling so a fast producer can't overwhelm slow consumers
- **Type safety at the channel level** -- catch misrouted messages immediately rather than downstream

## Quick Look

```ruby
require "typed_bus"

bus = TypedBus::MessageBus.new
bus.add_channel(:events, timeout: 5)

bus.subscribe(:events) do |delivery|
  puts delivery.message
  delivery.ack!
end

Async do
  bus.publish(:events, "hello world")
end
```

That's the basics. Each subscriber receives a `Delivery` envelope wrapping the message. Call `ack!` when you're done, or `nack!` to reject it. If you do neither, the delivery auto-nacks after the timeout and routes to the dead letter queue.

## Typed Channels

Lock a channel to a specific class and get an `ArgumentError` the moment something wrong is published:

```ruby
Order = Data.define(:id, :total)

bus.add_channel(:orders, type: Order, timeout: 10)

Async do
  bus.publish(:orders, Order.new(id: 1, total: 29.99))  # OK
  bus.publish(:orders, "not an order")                    # ArgumentError
end
```

## Dead Letter Queues

Failed deliveries don't vanish. Every channel has a DLQ you can inspect, drain, and hook into:

```ruby
bus.dead_letters(:orders).on_dead_letter do |delivery|
  reason = delivery.timed_out? ? "timeout" : "nack"
  log_failure(reason, delivery.message)
end

# Drain and retry later
bus.dead_letters(:orders).drain do |delivery|
  retry_order(delivery.message)
end
```

## Backpressure and Adaptive Throttling

Set `max_pending` on a channel and publishing blocks the fiber when the limit is reached. Add `throttle` to progressively slow publishers before they hit the hard limit:

```ruby
bus.add_channel(:pipeline,
  max_pending: 100,
  throttle: 0.5   # begin backoff at 50% remaining capacity
)
```

The throttle applies an asymptotic delay curve -- the first half of capacity fills at full speed, then each publish sleeps progressively longer as remaining capacity approaches zero. No spikes, no thundering herd, just a smooth ramp.

## Multi-Stage Pipelines

Where it gets interesting is wiring stages together. Here's a validation-then-processing pipeline with typed messages at each stage:

```ruby
RawEvent       = Data.define(:source, :payload, :timestamp)
ValidatedEvent = Data.define(:source, :payload, :validated_at)

bus = TypedBus::MessageBus.new
bus.add_channel(:raw_events, type: RawEvent,       timeout: 1, max_pending: 3)
bus.add_channel(:validated,  type: ValidatedEvent,  timeout: 0.3)

# Stage 1: Validate incoming events
bus.subscribe(:raw_events) do |delivery|
  event = delivery.message
  if event.payload.nil? || event.payload.empty?
    delivery.nack!
  else
    delivery.ack!
    bus.publish(:validated, ValidatedEvent.new(
      source: event.source,
      payload: event.payload,
      validated_at: Time.now
    ))
  end
end

# Stage 2: Process validated events
bus.subscribe(:validated) do |delivery|
  process(delivery.message)
  delivery.ack!
end
```

Each stage has its own type constraints, timeout, and DLQ. A bad event nacked at validation doesn't pollute the processing stage. A slow processor that exceeds its timeout gets collected for retry.

## Configuration Cascade

Settings resolve through three tiers -- **Global, Bus, Channel** -- so you can set sensible defaults and override where needed:

```ruby
TypedBus.configure do |config|
  config.timeout     = 60
  config.max_pending = 500
end

bus = TypedBus::MessageBus.new(timeout: 30)
bus.add_channel(:orders)                  # inherits timeout=30, max_pending=500
bus.add_channel(:alerts, timeout: 5)      # overrides timeout, inherits max_pending
```

## Stats

Built-in per-channel counters track published, delivered, nacked, timed-out, dead-lettered, and throttled messages:

```ruby
bus.stats[:orders_published]
bus.stats[:orders_delivered]
bus.stats[:orders_dead_lettered]
bus.stats.to_h   # snapshot of everything
```

## Multiple Buses

There's no singleton. Each `MessageBus` is an independent instance with its own channels, subscribers, and stats. Create as many as your application needs:

```ruby
# Separate concerns into isolated buses
orders_bus  = TypedBus::MessageBus.new(timeout: 30)
audit_bus   = TypedBus::MessageBus.new(timeout: 60, max_pending: 1000)
realtime_bus = TypedBus::MessageBus.new(timeout: 2)

orders_bus.add_channel(:created, type: Order)
orders_bus.add_channel(:fulfilled, type: Order)

audit_bus.add_channel(:events, type: AuditEntry)

realtime_bus.add_channel(:notifications, type: String, max_pending: 50)
```

Each bus tracks its own stats independently, so `orders_bus.stats` and `audit_bus.stats` never collide. This makes it straightforward to partition your messaging by domain, by latency requirements, or by team ownership.

## Get It

```bash
gem install typed_bus
```

Or add to your Gemfile:

```ruby
gem "typed_bus"
```

Requires Ruby 3.2+ and the [async](https://github.com/socketry/async) gem.

Source and docs: [github.com/MadBomber/typed_bus](https://github.com/MadBomber/typed_bus)

The repo includes 16 runnable examples covering everything from basic usage to concurrent pipelines and performance monitoring. Each one is standalone -- just `bundle exec ruby examples/01_basic_usage.rb` and go.

I'd love to hear feedback. Open an issue or drop me a note.
