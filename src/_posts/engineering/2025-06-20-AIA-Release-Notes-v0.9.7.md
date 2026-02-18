---
title: "AIA Release Notes v0.9.7"
categories:
  - Engineering
tags:
  - AIA
  - Ruby
  - Release Notes
  - CLI
  - Tools
  - LLM
---
**Powerful New Features for Enhanced AI-Powered Prompt Management**

<img src="/blog/images/aia.png" alt="May I take your prompt?">

The AI Assistant (AIA) CLI tool has evolved significantly since version 0.8.6, introducing powerful new capabilities that make it even more versatile for dynamic prompt management and AI interaction. Here's a comprehensive look at the major features and improvements that have been added.

*The complete changelog and detailed documentation are available in the [AIA repository](https://github.com/MadBomber/aia) and [wiki](https://github.com/MadBomber/aia/wiki).*

<!-- Tocer[start]: Auto-generated, don't remove. -->

## Table of Contents

  - [🛠️ Enhanced Tool Integration](#-enhanced-tool-integration)
    - [RubyLLM::Tool Support](#rubyllmtool-support)
    - [Shared Tools Integration](#shared-tools-integration)
    - [New Tool Discovery Commands](#new-tool-discovery-commands)
  - [🔍 Model Management & Discovery](#-model-management--discovery)
    - [Available Models Command](#available-models-command)
    - [Model Database Refresh](#model-database-refresh)
  - [📄 Executable Prompts Revolution](#-executable-prompts-revolution)
    - [Enhanced Executable Prompt Support](#enhanced-executable-prompt-support)
    - [STDIN/STDOUT Integration](#stdinstdout-integration)
  - [🌐 Web Content Integration](#-web-content-integration)
    - [Dynamic Web Content Inclusion](#dynamic-web-content-inclusion)
  - [🗣️ Improved Chat Experience](#-improved-chat-experience)
    - [Enhanced Directive Processing](#enhanced-directive-processing)
    - [Context Management](#context-management)
  - [🔧 Configuration & Compatibility](#-configuration--compatibility)
    - [Better Model Compatibility](#better-model-compatibility)
    - [Ruby LLM Migration](#ruby-llm-migration)
  - [🐛 Critical Bug Fixes](#-critical-bug-fixes)
    - [Output Handling](#output-handling)
    - [Directive Processing](#directive-processing)
  - [📈 Performance & Reliability](#-performance--reliability)
    - [Code Architecture Improvements](#code-architecture-improvements)
    - [Enhanced Logging & Debugging](#enhanced-logging--debugging)
  - [🔐 Security Enhancements](#-security-enhancements)
    - [Shell Command Safety](#shell-command-safety)
  - [🎯 Developer Experience](#-developer-experience)
    - [Testing Infrastructure](#testing-infrastructure)
    - [Documentation](#documentation)
  - [Getting Started with the New Features](#getting-started-with-the-new-features)
  - [Looking Forward](#looking-forward)

<!-- Tocer[finish]: Auto-generated, don't remove. -->

## 🛠️ Enhanced Tool Integration

### RubyLLM::Tool Support
AIA now provides comprehensive support for function calling through RubyLLM tools, enabling extended AI capabilities:

```bash
# Load tools from directory
aia --tools ~/my-tools/ --chat

# Load specific tool files
aia --tools weather.rb,calculator.rb --chat

# Filter tools with granular control
aia --tools ~/tools/ --allowed_tools weather,calc
aia --tools ~/tools/ --rejected_tools deprecated
```

### Shared Tools Integration
The new `shared_tools` gem integration provides a curated collection of ready-to-use functions:

```bash
# Access shared tools automatically
aia --require shared_tools/ruby_llm --chat

# Use specific shared tools
aia --require shared_tools/ruby_llm/edit_file --chat

# Combine with your own custom tools
aia --require shared_tools/ruby_llm --tools ~/my-tools/ --chat
```

### New Tool Discovery Commands
- Added `//tools` directive to show available tools and their descriptions
- Enhanced tool management with better filtering and selection capabilities

## 🔍 Model Management & Discovery

### Available Models Command
A new `--available_models` CLI option provides easy access to all supported AI models:

```bash
aia --available_models
```

This feature helps users discover and switch between different AI models based on their specific needs.

### Model Database Refresh
Introduced automatic model database refresh functionality:
- Configurable refresh intervals (default: 7 days)
- `--refresh` option to set refresh frequency
- Config file now tracks `last_refresh` for better state management

## 📄 Executable Prompts Revolution

### Enhanced Executable Prompt Support
The new `--exec` flag transforms how you create executable prompts:

```bash
#!/usr/bin/env aia run --no-out_file --exec
# Get current storm activity for the east and south coast

Summarize the tropical storm outlook for the Atlantic region.

//webpage https://www.nhc.noaa.gov/text/refresh/MIATWOAT+shtml/201724_MIATWOAT.shtml
```

### STDIN/STDOUT Integration
- Fixed piped content handling through STDIN
- Improved `--no-out_file` functionality for better CLI integration
- Executable prompts now work seamlessly with Unix pipes and command chaining

## 🌐 Web Content Integration

### Dynamic Web Content Inclusion
Enhanced web integration capabilities through the `pure.md` service:

```bash
# Include web pages directly in prompts
//include https://example.com/documentation
//webpage https://example.com/news-article
```

This feature enables real-time web content integration into your AI prompts.

## 🗣️ Improved Chat Experience

### Enhanced Directive Processing
The chat experience has been significantly improved with:
- Better handling of follow-up prompts with embedded directives
- Improved context management and conversation flow
- Enhanced error handling for directive processing

### Context Management
- Fixed issues with pre-loaded context in chat REPL
- Better handling of context files in chat mode
- Improved conversation history management

## 🔧 Configuration & Compatibility

### Better Model Compatibility
- Fixed SharedTools compatibility issues with models that don't support function calling
- Enhanced model detection and capability handling
- Improved error messages for unsupported features

### Ruby LLM Migration
Completed transition from `ai_client` to the more powerful `ruby_llm` gem:
- Better model support across providers
- Enhanced streaming capabilities
- Improved error handling and debugging

## 🐛 Critical Bug Fixes

### Output Handling
- Fixed issue with output going to default out_file even when `--no-out_file` is specified
- Resolved problems with piped text through STDIN not being handled correctly
- Improved executable prompt file handling

### Directive Processing
- Fixed `//clear` directive functionality in chat sessions
- Resolved issues with configuration directive processing
- Better handling of embedded parameters and shell integration

## 📈 Performance & Reliability

### Code Architecture Improvements
- Major refactoring for better maintainability
- Enhanced separation of concerns with new service classes
- Improved error handling throughout the codebase

### Enhanced Logging & Debugging
- Better debug output with `--debug` and `--verbose` flags
- Improved logging for troubleshooting
- Enhanced user feedback during AI processing

## 🔐 Security Enhancements

### Shell Command Safety
- Improved shell command validation and safety checks
- Better handling of dangerous command patterns
- Enhanced security documentation and best practices

## 🎯 Developer Experience

### Testing Infrastructure
- Comprehensive test suite improvements
- Better integration testing coverage
- Enhanced development tooling and workflows

### Documentation
- Extensive README updates with clearer structure
- Comprehensive wiki documentation
- Better examples and use cases

## Getting Started with the New Features

To take advantage of these new capabilities:

1. **Update AIA**: `gem install aia` (or `gem update aia`)
2. **Explore Available Models**: `aia --available_models`
3. **Try Tool Integration**: `aia --require shared_tools/ruby_llm --chat`
4. **Create Executable Prompts**: Use the new `--exec` flag for better CLI integration
5. **Discover Tools**: Use `//tools` in chat to see available functions

## Looking Forward

Version 0.9.7 represents a significant evolution in AIA's capabilities, making it more powerful, flexible, and user-friendly than ever before. The enhanced tool integration, improved model management, and better executable prompt support open up new possibilities for AI-powered automation and workflow enhancement.

Whether you're using AIA for code review, documentation generation, research, or interactive AI assistance, these new features provide the foundation for more sophisticated and powerful AI interactions.

---
