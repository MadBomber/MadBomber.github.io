---
title: "The Trouble With Users"
date: 2026-04-25
categories: engineering
tags:
  - Software Development
  - History
  - Requirements
  - AI
  - Career
---

![Requirements Up a Hill](/images/requirements_up_a_hill.png)

Requirements definition has always been a problem in software development.

<img src="/images/dragon.png" alt="The Dragon — a massive mainframe computer in its chilled room" style="float: right; width: 220px; margin: 0 0 1rem 1.5rem;">

In the early days we tended to a Dragon. The Machine was a massive, slumbering beast in a chilled room, and its hunger was insatiable. Machine time was vastly more expensive than the lives of the wizards hired to feed it. And wizards we were — or at least that is how we saw ourselves, and perhaps how others saw us too. We cast magic spells that no one else could understand, in languages no mortal was meant to speak: ASM, FORTRAN, APL, FORTH, RPG. Mystical incantations that summoned results from the void.

Then COBOL arrived — COmmon Business-Oriented Language — and the wizard's mystique took its first real hit. Suddenly the users could read the program. Not all of it, and not comfortably, but enough to point at a line and say "that doesn't look right." The spell was broken, at least partially. Languages proliferated, each staking out its niche domain. Which prompted an obvious question: could we have one language for everything? The answer was Ada — born from a U.S. Department of Defense mandate to unify the chaos, designed to be all things to all programmers. It was ambitious, rigorous, and admirably comprehensive. It also failed to stick. Ada tried to solve complexity by adding more complexity, and it collapsed under its own weight. Most engineers working today have never heard of it and would not recognize the name if they saw it. Unifying the language did nothing to unify the understanding between programmer and user.

<div style="clear: both;"></div>

---

<img src="/images/wizard.png" alt="The wizard programmer — casting spells at the keyboard in the glow of the machine" style="float: left; width: 220px; margin: 0 1.5rem 1rem 0;">

I started my career in the shadow of that Dragon — in the chilled room, feeding the beast. We spent weeks drawing flowcharts using fancy green plastic templates, poring over code printouts from the loud line printers, chasing bugs through crash dumps of hexadecimal numbers while doing the pointer math in our heads — or, if you were a lowly programmer like me, on paper with pencil. Only the analysts could do hex arithmetic in their heads. By the time I became an analyst I had the Texas Instruments Programmer calculator to do the math for me in decimal, binary, octal, and hex. Technology is marvelous!

We filled out coding forms using high-tech mechanical pencils — a symbol of our wizard standing — making sure our handwriting was clear so that the keypunch operators could see exactly what character we wanted in each card column. A program was a deck of cards — a small program might be a few dozen, a large one could be hundreds or thousands. Editing meant physically pulling cards out and replacing them with freshly punched ones. Drop your deck and you spent an unpleasant afternoon feeding it through the card sorter, pass after pass, until the sequence was restored.

The keypunch machines themselves evolved over time: the IBM 026 gave way to the IBM 029, which introduced a programmable drum card that could designate certain columns as numeric-only — preventing a letter from sneaking into a field that should only hold digits — and auto-increment sequence numbers into a reserved column on every card. That sequence numbering meant a dropped deck could be fed through the sorter and come back in the correct order automatically. It was a primitive but genuine attempt to catch mistakes before they propagated forward. Sound familiar?

Our coding forms were 24 lines of 80 characters each — matching exactly the 80 columns punched into each card. IBM did introduce a shorter 96-column card later, but by the time those arrived the CRTs had shown up and nobody much cared. Then came the CRT (Cathode Ray Tube) and OLTP (Online Transaction Processing). Those terminals could show us our code. We no longer had to review code from line printer output. And what a lucky coincidence that our CRTs could display characters on 24 lines of 80 characters. I wonder where that magic number came from.

With each new decade the cost of a programmer hour crept further past the cost of machine time. Rapid turnaround. We could make mistakes much faster than just a few years before. One of the things we lost along the way was our practice of showing report mock-ups to the end users of our printed reports. That was our only product. Printed reports. OLTP changed that. We now had online forms. Our keypunch operators became CRT data entry clerks. Our programs would take their entries, put them into files, and then generate the printed reports — which started to pile up, since our users discovered that we had the ability to show them an online form on their CRT for any specific part number they chose to enter. Wow. Indexed databases. Who would have ever guessed that technology would be so useful?

Of course our OLTP forms were never quite exactly the way a user wanted them to be.

> "I have to tab through several screens just to see what should have been on the first screen."

I suppose we should have created form mock-ups to show the users first. Wait — we did. They just changed their minds after actually using what they originally asked for. Who could have predicted that?

<div style="clear: both;"></div>

---

The big iron Dragon gave way to minicomputers — smaller dragons, decentralized into individual departments, each with their own corps of acolytes to tend them. The wizards were now co-mingled with their users. Surely this proximity would finally close the gap between what users asked for and what they actually got. No more mistakes would be made. From minicomputers came microcomputers, and from microcomputers came the personal computer. Now the users had their own machines. Better still, they could learn BASIC — Beginner's All-purpose Symbolic Instruction Code — a language gentle enough that a determined user could write a program themselves. The last of the wizard's mystique evaporated.

> "What do you mean it's going to take a month to implement this? It's just another IF statement."

They had learned enough to understand the words but not enough to understand the Dragon.

---

Something shifted when we moved from wizard programmers to engineers. The guild's unwritten rules — the shared instincts, the hard-won intuitions passed between practitioners over coffee and crash dumps — gave way to something far more official. Engineering meant process. Certified process. Documented process. Company policy, precisely worded and required to be followed to the letter. The animating idea was that if every developer adhered to the same rules, the same coding style, every developer became interchangeable. Management could finally breathe. If the process was followed correctly, the requirements would be implemented correctly. No more dependence on any individual wizard's inscrutable judgment. The craft had been systematized.

Requirements documents grew into massive tomes. UML diagrams multiplied. Agile arrived to save us from waterfall, and then SAFe arrived to make agile feel like waterfall again. User stories replaced use cases. And the underlying problem remained stubbornly unchanged: users do not know what they want until they see what they do not want.

Someone had noticed that Ada's top-down approach had failed and tried the opposite. Instead of one rigorous language for everything, what if you used a loose ecosystem of simple, domain-specific tools — each doing one thing well? HTML that anyone could read. CSS that a designer could touch. JavaScript accessible enough that a determined non-programmer could bend it to their will. Ruby — and Ruby on Rails especially — that let a small team ship a real working application in days instead of months. The browser became the CRT that everyone in the room could see at the same time. Edit, save, refresh — the feedback cycle compressed from weeks to seconds.

It was the most accessible, readable, user-friendly stack the industry had ever produced. Users could see it running. Stakeholders could click through it. Designers could adjust it without asking a programmer. For the first time, the people who wanted the software could actually touch it before it was finished.

And they still changed their minds.

---

The corporate overlords who controlled the purse strings noticed something interesting. If every engineer was interchangeable — same rules, same coding style, same process — then the expensive ones who had been around since the Dragon era could be quietly replaced with freshly minted graduates, indoctrinated in the process from day one and unburdened by any accumulated wisdom from the guild days. Clean, compliant, and half the price.

Then someone noticed that the process did not care about geography. An engineer in Bangalore who followed the same process was, by definition, interchangeable with an engineer in Dallas — at a fraction of the cost. The commodification of the craft was complete.

Now the AI-augmented era has arrived, and the overlords have made the same calculation again. AI-assisted engineers are more productive — significantly more productive — which means fewer of them are required. And since the AI is doing the heavy lifting, the engineers who remain do not need to be the expensive kind. They just need to follow the process. Monitor the output. File the tickets. The Dragon has a new handler, and it turns out the handler does not need to be a wizard at all.

---

Except now, in 2026, the machines do write code. Large language models, with a bit of prompting, will produce working software in minutes. Users can describe what they want in plain English and see it running before lunch. Requirements definition solved at last?

Not quite. Users still do not know what they want until they see what they do not want — it just happens faster now. The feedback cycle has compressed from months to minutes, but the fundamental human truth has not shifted one inch. We have simply built a high-speed rail to the same inevitable disappointment.

Perhaps the real lesson, spanning five decades of this industry, is that no tool or methodology has ever fixed the requirements problem, because it is not a technology problem. It is a communication problem dressed up in whatever costume the current decade provides. Flowcharts, UML, user stories, or natural language prompts — they are all just different ways of trying to get a human being to articulate clearly something they have not yet fully thought through. Good luck with that. I will see you at the next retrospective. Don't forget the digital sticky notes.
