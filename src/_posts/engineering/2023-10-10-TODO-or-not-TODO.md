---
title: "TODO or Not TODO"
categories:
  - Engineering
tags:
  - Prompt Engineering
  - AI
  - Code Generation
  - AIDD
---
It's an exciting time for software engineering. In this emerging era of generative AI, developers can refactor their approach to crafting code from scratch. The traditionally laborious task of going from concept to working code can now be significantly reduced. By using a pre-programmed Gen-AI, software engineers can conveniently get a first draft of their intended code.

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [The Gen-AI Prompt in Focus](#the-gen-ai-prompt-in-focus)
  - [How Does It Work?](#how-does-it-work)
  - [Do We Now Have AIDD Joining BDD and TDD?](#do-we-now-have-aidd-joining-bdd-and-tdd)
    - [Leveraging AI for the First Draft of Code](#leveraging-ai-for-the-first-draft-of-code)
  - [Wrapping Up](#wrapping-up)
  - [Example](#example)

<!-- Tocer[finish]: Auto-generated, don't remove. -->


## The Gen-AI Prompt in Focus

I use a great little utility on the command line to run my prompts. It is actually wrapped in my own parameterized prompt management system. In that system, any phrase like `[UPPERCASE]` is considered a parameter. All unique parameters are presented to the user for a value. That value is then substituted back into the prompt to form the actual prompt that gets presented to the Gen-AI.

Here is my "todo" prompt:

```
As an experienced [LANGUAGE] software engineer, write some [LANGUAGE] source code. Consider the following [LANGUAGE] file. For each comment line that contains the word "todo", take the text that follows that word as a requirement to be implemented in [LANGUAGE]. Remove the 'todo' word from the comment line. After the line, insert the [LANGUAGE] code that implements the requirement.
```

The AI, through this and other prompts like it, can facilitate the initial stage of code development.

## How Does It Work?

Like most "good" source code, the prompt is self-documenting. The AI scans through a file containing source code in a specified programming language. For each comment line that contains the word "todo", it interprets the following text as a requirement for code that needs to be written. It then uses this requirement to construct the necessary piece of code in the same language. Afterward, it removes the "todo" word and replaces the entire comment line with a comment line having only the requirement text followed by executable lines with the newly generated code.

Developers can write out their ideas or plans in a comment line using normal, human-readable language, and the AI takes care of translating this into functional code. It's as good as dictating to the AI what you intend for the program to do, and it writes it out for you.

## Do We Now Have AIDD Joining BDD and TDD?

### Leveraging AI for the First Draft of Code

It's important to note that this approach doesn't replace the need for creative software engineers, but it expedites the path to a working prototype. Engineers can focus on creating more complex, unique functionalities while the AI takes care of the more mundane coding tasks. It eliminates the need for writing all parts of the application from scratch.

Having a first draft produced by the AI enables developers to improve efficiency and productivity. It not only helps improve the turnaround time for software projects, but it also provides a solid foundation for building more complex applications.

This was the same argument for new software technology that was given to the switch flippers when assembly language was developed to enable developers to be more productive over toggling in the machine code. The assembly programmers got the same pitch when the compiler developers presented their first languages. I can also imagine Matz giving the same pitch when he introduced the world's best computer language, Ruby, since it is so much better than anything that has come before.

Developers can use this process (AIDD - AI Driven Development) as a learning tool, particularly those just getting started in a new programming language. By observing how the AI constructs simple programs from human-readable requirements, they can get a grasp of the syntax and structure of the new language.

**Historical Aside:** I actually used that same argument in the late 1970s when I created my "genasys" program on the Apple ][ computer. Genasys (GENerate A SYStem) took a set of requirements as text and auto-generated an application program in one of five different computer languages. Sounds like 50 years ago I was doing the same thing as we are today with the gen-AI LLMs. Is there anything new left to be done in software engineering? I'm sure that question will put me in the same hall of fame as IBM's president Thomas J. Watson, who in the 1940s is reputed to have said: "I think there is a world market for about five computers." I have that many sitting on and under my desk.

## Wrapping Up

Generative AI (gen-AI) has opened opportunities for automation in software engineering. With a valuable aid in creating the first draft of code, software developers can now focus more on implementing advanced features, optimizing the code, and generally making the software more robust and efficient. Besides, it may also guide novice programmers into understanding a new programming language better.

The era of AI is indeed revolutionizing how we develop software applications. And with AI tools becoming more sophisticated, we can expect a more significant change in the landscape of software engineering.

The comprehensive adoption and integration of the gen-AI system remain a challenge for many. However, the benefits, efficiency, and potential cost and time savings of this innovative approach to software application development cannot be ignored. It's an interesting prospect for the future of software engineering.

My friend Squirrel reminds us that "Garbage In - Garbage Out" is the first principle of software engineering. With that in mind, let's end with an example usage of this "todo" prompt.

## Example

Granted, all examples are simplistic; but it's from the simplest of things that life is made.

This was my file:

```ruby
class Utility
  class << self
    # TODO: Need a method to sort an Array of hashes by a specific key
    # TODO: a method that sends a string parameter to STDERR prefixed with 'ERROR:' then exits with a non-zero exit code
    # TODO: a method that returns the first 100 prime numbers in an array.
  end
end
```

This is what I got after running the prompt against it:

```ruby
class Utility
  class << self
    # Need a method to sort an Array of hashes by a specific key
    def sort_array_of_hashes(array, key)
      array.sort_by { |hash| hash[key] }
    end

    # A method that sends a string parameter to STDERR prefixed with 'ERROR:' then exits with a non-zero exit code
    def send_error_and_exit(message)
      STDERR.puts "ERROR: #{message}"
      exit(1)
    end

    # A method that returns the first 100 prime numbers in an array.
    def first_hundred_primes
      primes = []
      number = 2
      while primes.size < 100
        primes << number if prime?(number)
        number += 1
      end
      primes
    end

    private

    def prime?(number)
      return false if number < 2
      (2..Math.sqrt(number)).none? { |i| number % i == 0 }
    end
  end
end
```
