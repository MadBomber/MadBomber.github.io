---
layout: blog_post
title: "Pencils Down: My Take on DHH's Rails World 2026 Keynote"
date: 2026-09-26
categories:
  - Engineering
permalink: /blog/engineering/pencils-down/
tags:
  - Rails
  - Ruby
  - AI
  - History
  - Career
  - Photography
---

# Pencils Down: My Take on DHH's Rails World 2026 Keynote

This week David Heinemeier Hansson opened [Rails World 2026](https://rubyonrails.org/world/2026/) in Austin, Texas, with a keynote that has had the Ruby community talking ever since. A few days later Matt Solt asked me, "By the way, I'm curious to know your thoughts on David's keynote."

I watched it. I agree with him 100%.

My reply to Matt ran longer than he probably expected, and it turned into this post.

## What David said

If you haven't seen it, the [opening keynote is on YouTube](https://www.youtube.com/watch?v=vDjW_dRyKXY). The short version: hand-writing code is no longer an economically viable skill for most programmers at most companies. He didn't pitch that as doom. He pitched it as an inflection point.

He dates the shift to November 24, 2025, the day Claude Opus 4.5 was released, and calls it "the Kodak Brownie of our era." The Brownie was the cheap box camera that put photography in everybody's hands and made the portrait painter's trade a niche. His evidence is personal and blunt. By his own count he wrote about 150,000 lines of code in August 2026 alone, against a historical average of about 30,000 lines a year. At 37signals, hand-writing code is now "an exceptional state," something you notice the way you notice a bug in Sentry.

Some of the rest:

- The old "10x programmer" argument is over. He puts the gap between the weakest human-only developer and the strongest agent-directed developer closer to 1,000x.
- HEY is being rebuilt as six native apps with a Rust backend, all of it written by agents. He says it can carry HEY's peak traffic on a single Raspberry Pi.
- He loves Rust "if you never, ever, ever have to look at it yourself." The agents carry the maintenance burden he would never take on by hand.
- Rails' convention over configuration is an asset for agent-generated code, not a liability.
- And a homework assignment: "If your app doesn't have a CLI, I want to see it by next Friday."

"Pencils down" was the line that stuck with most people. (The quotes here come from the video and from secondary coverage, so treat the exact wording as close paraphrase.)

## Two kinds of programmers

There have always been at least two kinds of computer programmers, to use the old term. Some got into the industry as a way to make a living and never touch the silly machines once the quitting-time bell rings. The rest of us are in it for the rush: that quick, creative loop where an idea turns into a working thing almost instantly.

David is clearly in the second group, and so am I. That's why his keynote didn't sound to me like the end of programming. It sounded like the next language.

## Every language era, and now English

My first language was APL, in the fall of 1970. The tools back then were 80-column punched cards, paper tape, IBM Selectric typewriters doubling as computer consoles, and line printers 132 characters wide. IBM big iron filled the computer room. Cards and paper tape gave way to magnetic tape and CRTs. Data lived on stacked platters in a disk cartridge the size of an automobile tire, holding a staggering 5 megabytes.

Since then I've written programs in every language era: assembly, Forth, BASIC, Fortran, PL/I, Lisp, Prolog, COBOL, Ada, C, C++, and plenty that never made it to commercial viability. Each one changed what I had to hold in my head and what I could leave to the machine. Assembly made me track registers. Fortran let me write formulas. Lisp let me write programs that wrote programs. None of them felt like a loss at the time. Each felt like getting more reach.

From 2005 on, Ruby was the only language I used. Then in the fall of 2025 I retired from the industry, the same season David marks as the turning point, and started programming in English. I haven't stopped. Programming computers is still fun.

## The Brownie and my cameras

David built his keynote around a photography analogy, and that one landed with me, because photography has been my hobby for as long as computers have been my work.

I started with film on Leica and Nikon cameras. Focus, exposure, and framing were all mine to get right. When my eyesight began to fail I switched to autofocus bodies from Minolta and Canon and let the camera take over a job my eyes no longer could. I didn't stop being a photographer when the camera started focusing for me. I kept shooting because it did.

Film also made every frame count. I would wait hours for the sun to get just right, then take a few frames, or the entire roll if I was feeling like Daddy Warbucks. Then digital cameras entered my camera bag. Where I once needed a few frames to get one sellable image, I now shot hundreds, sometimes stacking them to improve their quality. Frames stopped being scarce, and I got to spend my attention on the picture instead of the budget.

Since the iPhone arrived with its computational photo pipeline, I've taken more portraits and landscapes with it than with any other camera I've owned. Now the phone does the stacking for me, along with reading faces and balancing highlights before I've even decided the picture is worth keeping. My job is to see the picture and be there when it happens.

Each step took something off my hands and left me more room to be creative. Code is going the same way. The part I used to type is now the part I describe.

## Science fiction caught up

None of this came out of nowhere. Science fiction spent decades showing us what smart machines might do for us.

*Forbidden Planet* gave us Robby the Robot, plus a 3D holographic video display that hardly anyone remembers. *Star Trek* in the 1960s gave us a computer you could simply talk to, the handheld computer pad, and the little hard-shell cartridges Mr. Spock called "tapes," which look an awful lot like the 3.5-inch diskettes that showed up years later.

Today holographic projection, 3D gesture control, and two-way voice interfaces are real. Neuralink is right on the edge. NASA's interplanetary network is just getting started. The Enterprise computer that answered in plain English was the most far-fetched prop on the set. It's the one I use every day now.

## Fifty-five years of the same pattern

I've had a close-up view of some of that frontier. My career ran through health care, research, oil and gas, video games, and the military. I was at NASA at the beginning of the International Space Station deployment and occupation missions, then went back to working with the military after 9/11.

Across all of those fields and fifty-five years, the pattern has held every time: when the machine gets smarter, the person using it gets to spend more time on the part that matters.

## The fair questions

The keynote has its critics, and some of their points are worth hearing. The Raspberry Pi claim mixes a big architectural change (moving rendering to the client) with the Rust rewrite, and no benchmark methodology has been published. David also told the story of "Basecamp 5," where thirty agent-generated pull requests each looked fine on their own and together left the architecture "like Swiss cheese." His answer was better models. Others answered that a stronger model doesn't solve an ownership problem; somebody still has to own the whole.

I'd put that in the same column as everything else in this post. Owning the whole is the part that matters. It was the analyst's job when I was feeding the mainframe, and it's the job of whoever is directing the agents now. The machine got smarter. The person still has to know what they're building.

## Still the MadBomber

So yes, I agree with David. I've put down a lot of tools since 1970, and every one was replaced by something that let me do more. English is just the latest language on my list, and like all the others, it's fun.

One more thing from those early days. I got my nickname at a manufacturing company in Houston, Texas, while we were rolling out IBM's Time Sharing Option (TSO) and CRTs across the company. Whenever I touched one of the computer cabinets, the static electricity I was carrying would crash the system. Occasionally my programs would crash it too. Back then we said a failed program had "bombed," so the computer operators and the tape apes started calling me The MadBomber.

Half a century later the tape apes are gone and I write my programs in English. I'm still the MadBomber. I just don't bomb much anymore.
