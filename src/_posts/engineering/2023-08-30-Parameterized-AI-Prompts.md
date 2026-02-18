---
title: "Parameterized AI Prompts"
categories:
  - Engineering
tags:
  - Ruby
  - Prompt Engineering
  - AIA
  - Templates
  - CLI
---
**Parameterized AI Prompts**

Over the last few days, I have created a simple Ruby program called `aip.rb` in my scripts repository on GitHub. This program allows me to run stored gen-AI prompts against input text files and generate an output. The program follows the input-process-output (IPO) paradigm, but since AI is involved, it adheres to the principle of "garbage in, garbage out," as my friend @Squirrel would say. The AI processing part is handled by `mods`, a CLI tool that provides access to OpenAI's GPT-4 large language model (LLM). The Ruby code manipulates the command parameters, executes the command, and saves the output to a file.

- **GitHub:** [aip.rb at MadBomber/scripts](https://github.com/MadBomber/scripts)
- **GitHub mods:** [charmbracelet/mods](https://github.com/charmbracelet/mods)

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [Prompt Files and Keyword Replacement](#prompt-files-and-keyword-replacement)
  - [Reflections on Past Programming Endeavors](#reflections-on-past-programming-endeavors)

<!-- Tocer[finish]: Auto-generated, don't remove. -->


## Prompt Files and Keyword Replacement

In my `$HOME` directory, there is a directory called `.prompts` which serves as a private git working directory containing text files. These text files are referred to as "prompts" and are used as input for the gen-AI tool. The prompts are parameterized, and any text enclosed within square brackets and in uppercase is considered a keyword. The `aip.rb` program identifies all unique keywords within the prompts, while also excluding comment lines that begin with the `#` character. The program prompts the user to provide replacements for each unique keyword found in the prompt.

For example, one of the prompts called `any2any` looks like this:

```plaintext
# .prompts/any2any.txt
# Convert a code snippet from one language into another
As a highly skilled [TO] software engineer with a detailed understanding of the [FROM] programming language, convert this [FROM] file into an equivalent [TO] file:
```

This particular prompt allows me to generate a Ruby method from a Python example. Any FROM / TO conversion is possible using the prompt.

## Reflections on Past Programming Endeavors

Recently, I wrote a prompt that generates a custom cover letter based on my resume, biographical information, and a job description file. The prompt does a good job of creating an initial draft.

This made me reminisce about the first time I wrote a program to assist me in finding a new job, which took place many years ago in the last century. At the time, I had an Apple ][ computer connected to a bulletin board system (BBS) via a DC Hayes 1200 baud modem. The program, written in BASIC, connected to a BBS job site, downloaded all the job titles posted after a specific date, and filtered them for relevant keywords. For the titles that matched the keywords, the program retrieved and printed the entire job description to a dot matrix printer.

For the positions that interested me, I would manually address an envelope, insert a copy of my resume, affix a stamp, and seal it. At the end of the week, I would take all my job applications into town and drop them in the mailbox. In a week, I would typically send out anywhere from 5 to 15 letters.

I also had a telephone answering machine that I could access remotely. After sending out resumes for a few weeks, I would pack my camping and camera gear into the truck and head out to the great southwest to take "wild-light" photographs. Every few days, I would check into a motel to freshen up, enjoy a good meal, and rest in a comfortable bed. I would call home to retrieve my messages. If any message sounded interesting, I would return the call the following day before heading to the next location to capture more impressive shots of nature's light displays.

This was a classic example of a "PULL" architecture, where I had to call home to get updates. Nowadays, we live in a "PUSH" world where we are constantly connected. Our smartphones keep us immediately accessible through audio, video, direct messages, and email. Sometimes, it can feel overwhelming. That's when I find solace in leaving my phone behind during walks around the neighborhood… then my watch goes off with a text message.

Indeed, technology is wonderful!
