---
title: "Gen-AI Prompt Management with Ruby"
categories:
  - Engineering
tags:
  - Ruby
  - Prompt Engineering
  - prompt_manager
  - AI
  - CLI
---
With the advent of Generative AI, managing a vast number of AI prompts has become a challenge for developers and content creators. The `prompt_manager` gem provides an efficient and organized way to handle prompts using the file system or a database. This powerful tool allows categorization, searchability, and storage of prompts, positioning itself as an invaluable asset in the world of Generative AI.

To see how the `prompt_manager` gem's `FileSystemAdapter` is used in a CLI application, take a look at the [AI Assistant (aia) gem](#).

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [Using the `prompt_manager`](#using-the-prompt_manager)
  - [Setup and Configuration](#setup-and-configuration)
    - [Setup a Directory for Playing](#setup-a-directory-for-playing)
  - [Starting an IRB Session](#starting-an-irb-session)
  - [Working with Prompts in IRB](#working-with-prompts-in-irb)
    - [Listing Prompts](#listing-prompts)
    - [Accessing Prompts](#accessing-prompts)
    - [Access the Prompt Text Content](#access-the-prompt-text-content)
    - [Retrieving Prompts](#retrieving-prompts)
    - [Saving Prompts](#saving-prompts)
    - [Deleting Prompts](#deleting-prompts)
    - [Searching for Prompts](#searching-for-prompts)
  - [Parameterized Prompts](#parameterized-prompts)
    - [Parameter Values for Keywords](#parameter-values-for-keywords)
  - [Customization and Extensibility](#customization-and-extensibility)

<!-- Tocer[finish]: Auto-generated, don't remove. -->


## Using the `prompt_manager`

The `PromptManager::Storage::FileSystemAdapter` class is a cornerstone of the `prompt_manager` gem that interfaces with local or remote file systems, enabling developers to manage prompts effortlessly. The implementation offers various methods to administer prompts, such as listing, searching, getting, saving, deleting, and substituting parameter values for embedded keywords within the prompt text.

## Setup and Configuration

In this article's examples, the `FileSystemAdapter` class is being used. Before utilizing the file system adapter, it is crucial to configure `prompts_dir` appropriately. This directory serves as the root where all prompt data files are stored.

### Setup a Directory for Playing

```bash
mkdir prompts_dir
cd prompts_dir
export PROMPTS_DIR=`pwd`
gem install amazing_print word_wrap prompt_manager
```

You do not have to install the `amazing_print` or `word_wrap` gems, but they are handy to have available when playing with IRB.

In an application program that uses `PromptManager` and its `FileSystemAdapter`, you would typically configure the `storage_adapter` like this:

```ruby
require 'prompt_manager'
# require the specific storage adapter to be used...
require 'prompt_manager/storage/file_system_adapter'

PROMPTS_DIR = Pathname.new ENV['PROMPTS_DIR']
PromptManager::Prompt.storage_adapter =
  PromptManager::Storage::FileSystemAdapter.config do |config|
    config.prompts_dir        = PROMPTS_DIR
    config.prompt_extension   = '.txt'  # default
    config.params_extension   = '.json' # default
    config.search_proc        = nil     # default
  end.new
```

## Starting an IRB Session

Here is an example `.irbrc` file to use in that directory.

```ruby
require 'amazing_print'
require 'word_wrap'
require 'prompt_manager'
require 'prompt_manager/storage/file_system_adapter'

PromptManager::Prompt.storage_adapter =
  PromptManager::Storage::FileSystemAdapter.config do |config|
    config.prompts_dir = ENV['PROMPTS_DIR']
  end.new

include PromptManager
```

Note that including the `PromptManager` namespace allows us to work directly with the `Prompt` class. This is okay when using the `FileSystemAdapter`; however, it may not be desirable when using a database backend for the storage adapter, as the `Prompt` class name may conflict with a database-backed model using the same name.

## Working with Prompts in IRB

Prompts are managed using prompt IDs, which follow a specific format defined by the `PROMPT_ID_FORMAT` regular expression. These IDs can represent categories by utilizing sub-directories within the `prompts_dir`. For instance, a prompt with the ID `science/physics` would map to a file `physics.txt` within a `science` sub-directory. There is no limitation on the depth of the sub-directories used within the `PROMPTS_DIR`. The organization is completely up to the application program.

```ruby
Storage::FileSystemAdapter::PROMPT_ID_FORMAT #=> /^[a-zA-Z0-9\-\/_]+$/
```

### Listing Prompts

The `FileSystemAdapter` adds a `list` command that returns an Array of all prompt IDs found in the `PROMPTS_DIR`.

```ruby
Prompt.list #=> []
# Array of Strings but our PROMPTS_DIR is empty in this scenario
```

### Accessing Prompts

The path to a prompt's text file can be retrieved using the `path` method on a prompt instance or by using the `path` class method on `Prompt`, passing in the prompt ID.

```ruby
ex = Prompt.create(id: 'expert', text: 'what word typically follows "hello"')
#=> #<PromptManager::Prompt:0x0000000104101238 @id="expert", ...>

ex.path #=> A Pathname object to the file "expert.txt"
# or
Prompt.path('expert') #=> ditto
```

### Access the Prompt Text Content

The easy way to access the content of a prompt's text file is just to ask the prompt instance for its text.

```ruby
ex.text #=> "what word typically follows \"hello\""
```

The `text` method returns a String. You can use the `wrap` method from the `word_wrap` gem to make the prompt's text easier to read. This is very helpful when dealing with long prompts.

### Retrieving Prompts

To fetch the textual content and parameters of a prompt, the `get` instance method is provided.

```ruby
ex = Prompt.get(id: 'expert')
#=> #<PromptManager::Prompt:0x00000001045f2080 @id="expert", ...>
```

### Saving Prompts

Prompts can be saved or updated using the `save` instance method.

```ruby
ex = Prompt.get(id: 'expert')
# do stuff to prompt
ex.save #=> true
```

### Deleting Prompts

The deletion of a prompt is as simple as invoking the `delete` instance method.

```ruby
ex = Prompt.get(id: 'expert')
ex.delete #=> true
```

### Searching for Prompts

The `search` class method enables searching among prompt texts. If provided, the `search_proc` can customize search functionality.

```ruby
ex = Prompt.create id: 'expert', text: 'As a [LANGUAGE] expert advise me on refactor'
Prompt.search('refactor') #=> ['expert']
```

## Parameterized Prompts

Keywords can be embedded within the prompt's text, as seen in the previous version of the "expert" prompt where the `[LANGUAGE]` phrase acts as a placeholder (aka keyword) for a value to be filled in later. To get an Array of keywords, you can ask the `Prompt` instance.

Keywords are defined by a regular expression. The square brackets enclose the keyword and are considered to be part of it. Only upper case letters, space, underscore, and the pipe symbol are allowed in a keyword.

```ruby
Prompt::PARAMETER_REGEX #=>  /(\[[A-Z _|]+\])/
ex.keywords #=> [ '[LANGUAGE]' ]
ex.parameters #=> {"[LANGUAGE]"=>[]}
```

The pipe symbol is just a handy way of writing a keyword to express options to the user. For example, `[LONG | SHORT | VERBOSE | TERSE]` is a reminder that there are several options that would work in replacing the keyword in the prompt. There is no validation to ensure that the value used is one of those suggested within the keyword at this time.

### Parameter Values for Keywords

The `Prompt` object has a Hash called `parameters`, whose keys are the keywords from the text of the prompt. The value for each keyword entry in the `parameters` Hash is an Array of Strings. The last entry in the Array is the most recently used value substituted for that keyword.

```ruby
ex.parameters #=> {"[LANGUAGE]"=>[]}
ex.parameters[ '[LANGUAGE]' ] << 'Ruby' #=> ['Ruby']
```

Applications that use `prompt_manager`, like the AI Assistant (aia) gem, may put a limit on the number of entries in a parameters value Array.

The purpose of having an Array of historical values used for a keyword is to allow the application program — like aia - to provide the user access to the previous values for re-use or editing into a new value.

## Customization and Extensibility

Developers can extend the capabilities of the file system adapter by defining a custom `search_proc` or modifying file extensions for reading and saving prompts and their parameters.

Using the `prompt_manager` gem simplifies the Generative AI prompt management by organizing them in a file system construct, which enhances productivity and enables a smoother workflow for Ruby developers. Its customizable and extensible design ensures that it can adapt to various project needs, making it a must-have tool in your Ruby AI toolkit.
