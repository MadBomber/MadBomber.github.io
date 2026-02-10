---
title: "Warping Mines with gen-AI"
categories:
  - Engineering
tags:
  - Prompt Engineering
  - AI
  - Code Generation
  - Ruby
---
**Warping Mines with gen-AI**

Use a bottom-up design approach when crafting gen-AI prompts. Use a small context in the prompts. Baby steps will still get you to where you are going. Have fun. Software is not hard. Neither is AI.

I have been working with various artificial intelligence (another term for mostly stupid according to my friend Squirrel) techniques both personally and professionally for about 40 years.

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [The Rise of NLP and gen-AI](#the-rise-of-nlp-and-gen-ai)
  - [Exploring Warp](#exploring-warp)
    - [Warp: Your Terminal, Reimagined](#warp-your-terminal-reimagined)
    - [GitHub - charmbracelet/mods](#github---charmbraceletmods)
  - [Crafting Prompts for gen-AI](#crafting-prompts-for-gen-ai)
    - [GIGO — Garbage In, Garbage Out](#gigogarbage-in-garbage-out)
  - [Example Prompts](#example-prompts)
    - [Prompt 1](#prompt-1)
    - [Prompt 2](#prompt-2)
    - [Enhancing my_sort](#enhancing-my_sort)
    - [Documenting my_sort](#documenting-my_sort)
    - [Creating a Test File for my_sort Using Minitest](#creating-a-test-file-for-my_sort-using-minitest)
  - [Trying Something Off the Wall](#trying-something-off-the-wall)
    - [Convert my_sort and Its Test File into Python](#convert-my_sort-and-its-test-file-into-python)
    - [Now Convert It to Java](#now-convert-it-to-java)
    - [Convert my_sort to COBOL](#convert-my_sort-to-cobol)
  - [Bottom Line](#bottom-line)

<!-- Tocer[finish]: Auto-generated, don't remove. -->


## The Rise of NLP and gen-AI

One of the things that I had to deal with as Chief Engineer on government projects at the turn of the century were all these vendors coming out of the woodwork with new natural language processing (NLP)-powered internet search engines which would give "better quicker answers" to queries. Their presentations were slick. Their canned demos made you think that you really needed their product - which is exactly what slick presentations and canned demos are supposed to do.

None of them were worth their 6-figure price tags. A properly reasoned keyword search in any of the popular internet search engines at the time would find the same answers faster and cheaper.

I'm seeing that same pattern today with this new large language model (LLM) generative AI (gen-AI) — not to be confused with last century's general AI which is a whole different kind of thing. Companies are falling over themselves trying to come to market with AI-powered business tools. Most of what I see are targeted to marketing, copywriters, and sales. There are a few that are focused on software development.

The concepts behind gen-AI look okay; however, like the NLP-based search engines of the past, it takes a properly crafted request (called a prompt in the gen-AI lingo) to get acceptable answers. But those answers must not be taken as the golden truth. Each must be reviewed carefully before being accepted into any developer's code base.

## Exploring Warp

For the last few months, I've been trying out **Warp**, which has the ability to query a gen-AI from the command line.

### Warp: Your Terminal, Reimagined

Warp is a modern, Rust-based terminal with AI built in so you and your team can build great software, faster. Now… [warp.dev](https://www.warp.dev)

I've also been using "mods" on the command line.

### GitHub - charmbracelet/mods

[AI on the command line.](https://github.com/charmbracelet/mods) Contribute to charmbracelet/mods development by creating an account on GitHub.

In the old days, we had "knowledge engineering" which captured the content for the knowledge-based systems (KBS) — an unfortunate term since all systems are knowledge-based. Today, "Prompt Engineering" is becoming a thing.

## Crafting Prompts for gen-AI

Let's tell gen-AI to write some software using prompts. In crafting the prompt, using a small context seems to get better results quicker. As a rule-of-thumb, focus on part of the problem one step at a time. Think of it as bottom-up coding. Instead of prompting for an entire class that does "all of this stuff," take the time to think about each method you want the gen-AI to write. Your prompt sets the pattern to be used for the output.

### GIGO — Garbage In, Garbage Out

GIGO never goes away. It is the first rule of software engineering along with "bad requirements — bad software," which you could argue is the same thing. Think of prompts as your requirements.

## Example Prompts

Let's take a look at some prompts and see what we get.

### Prompt 1

```ruby
create a method in the ruby programming language that is named 'my_sort' The method should take an Array object named an_array as its single parameter. create a new object named an_array_without_nils by rejecting all elements in an_array which are nil. create a new object named results which is a sorted version of the an_array_without_nils object. Return the result array.
```

**Response:**

```ruby
def my_sort(an_array)
  an_array_without_nils = an_array.reject(&:nil?)
  results = an_array_without_nils.sort
  return results
end
```

### Prompt 2

Let's drop the context and use a different prompt that is less "prescriptive."

```ruby
create a Ruby method named my_sort which takes an array object, removes all entries that are nil and returns a new array that is sorted.
```

**Response:**

```ruby
def my_sort(array)
  array.compact.sort
end
```

You can build upon context. The gen-AI's answer becomes part of your session's context. So now you can craft prompts to augment the existing context.

### Enhancing my_sort

```ruby
protect my_sort from a bad parameter
```

**Response:**

```ruby
def my_sort(array)
  unless array.is_a?(Array)
    raise ArgumentError, "Invalid parameter. Expected an array."
  end
  array.compact.sort
end
```

### Documenting my_sort

```ruby
# Sorts an array by removing nil entries and returning a new sorted array.
#
# @param array [Array] The array to be sorted.
# @return [Array] The sorted array without nil entries.
# @raise [ArgumentError] If the parameter is not an array.
def my_sort(array)
  unless array.is_a?(Array)
    raise ArgumentError, "Invalid parameter. Expected an array."
  end
  array.compact.sort
end
```

### Creating a Test File for my_sort Using Minitest

```ruby
require 'minitest/autorun'

class MySortTest < Minitest::Test
  def test_sorts_array_and_removes_nil_entries
    my_array = [3, nil, 1, 5, nil, 2]
    sorted_array = my_sort(my_array)
    assert_equal [1, 2, 3, 5], sorted_array
  end

  def test_returns_empty_array_when_given_empty_array
    my_array = []
    sorted_array = my_sort(my_array)
    assert_equal [], sorted_array
  end

  def test_raises_argument_error_when_given_non_array_parameter
    assert_raises(ArgumentError) { my_sort("not an array") }
  end
end
```

## Trying Something Off the Wall

### Convert my_sort and Its Test File into Python

```python
def my_sort(array):
    if not isinstance(array, list):
        raise TypeError("Invalid parameter. Expected a list.")
    return sorted(filter(lambda x: x is not None, array))

import unittest

class MySortTest(unittest.TestCase):
    def test_sorts_list_and_removes_none_entries(self):
        my_list = [3, None, 1, 5, None, 2]
        sorted_list = my_sort(my_list)
        self.assertEqual([1, 2, 3, 5], sorted_list)

    def test_returns_empty_list_when_given_empty_list(self):
        my_list = []
        sorted_list = my_sort(my_list)
        self.assertEqual([], sorted_list)

    def test_raises_type_error_when_given_non_list_parameter(self):
        with self.assertRaises(TypeError):
            my_sort("not a list")

if __name__ == '__main__':
    unittest.main()
```

### Now Convert It to Java

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.Arrays;
import java.util.List;

public class MySortTest {
    @Test
    public void testSortsListAndRemovesNullEntries() {
        List<Integer> myList = Arrays.asList(3, null, 1, 5, null, 2);
        List<Integer> sortedList = MySort.mySort(myList);
        assertEquals(Arrays.asList(1, 2, 3, 5), sortedList);
    }

    @Test
    public void testReturnsEmptyListWhenGivenEmptyList() {
        List<Integer> myList = Arrays.asList();
        List<Integer> sortedList = MySort.mySort(myList);
        assertEquals(Arrays.asList(), sortedList);
    }

    @Test
    public void testThrowsIllegalArgumentExceptionWhenGivenNullParameter() {
        assertThrows(IllegalArgumentException.class, () -> {
            MySort.mySort(null);
        });
    }
}
```

### Convert my_sort to COBOL

```cobol
IDENTIFICATION DIVISION.
PROGRAM-ID. MY-SORT.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 ARRAY-SIZE PIC 9(4).
01 ARRAY OCCURS 100 TIMES DEPENDING ON ARRAY-SIZE.
   05 ARRAY-ELEMENT PIC 9(4).
PROCEDURE DIVISION USING ARRAY-SIZE, ARRAY.
   PERFORM VARYING ARRAY-ELEMENT-INDEX FROM 1 BY 1
       UNTIL ARRAY-ELEMENT-INDEX > ARRAY-SIZE
       IF ARRAY(ARRAY-ELEMENT-INDEX) = SPACES
           MOVE ARRAY-ELEMENT-INDEX TO ARRAY-SIZE
           EXIT PERFORM
       END-IF
   END-PERFORM
   PERFORM VARYING ARRAY-ELEMENT-INDEX FROM 1 BY 1
       UNTIL ARRAY-ELEMENT-INDEX > ARRAY-SIZE
       IF ARRAY(ARRAY-ELEMENT-INDEX) = SPACES
           MOVE ARRAY(ARRAY-SIZE) TO ARRAY(ARRAY-ELEMENT-INDEX)
           MOVE SPACES TO ARRAY(ARRAY-SIZE)
           SUBTRACT 1 FROM ARRAY-SIZE
       END-IF
   END-PERFORM
   PERFORM VARYING ARRAY-ELEMENT-INDEX FROM 1 BY 1
       UNTIL ARRAY-ELEMENT-INDEX > ARRAY-SIZE - 1
       PERFORM VARYING ARRAY-ELEMENT-INDEX2 FROM ARRAY-ELEMENT-INDEX + 1 BY 1
           UNTIL ARRAY-ELEMENT-INDEX2 > ARRAY-SIZE
           IF ARRAY(ARRAY-ELEMENT-INDEX) > ARRAY(ARRAY-ELEMENT-INDEX2)
               MOVE ARRAY(ARRAY-ELEMENT-INDEX) TO TEMP
               MOVE ARRAY(ARRAY-ELEMENT-INDEX2) TO ARRAY(ARRAY-ELEMENT-INDEX)
               MOVE TEMP TO ARRAY(ARRAY-ELEMENT-INDEX2)
           END-IF
       END-PERFORM
   END-PERFORM
   DISPLAY "Sorted Array:"
   PERFORM VARYING ARRAY-ELEMENT-INDEX FROM 1 BY 1
       UNTIL ARRAY-ELEMENT-INDEX > ARRAY-SIZE
       DISPLAY ARRAY(ARRAY-ELEMENT-INDEX)
   END-PERFORM
   STOP RUN.
```

## Bottom Line

GIGO is alive and well in the 21st century. Use a bottom-up design approach when crafting gen-AI prompts. Use a small context in the prompts. Baby steps will still get you to where you are going. Have fun. Software is not hard. Neither is AI.
