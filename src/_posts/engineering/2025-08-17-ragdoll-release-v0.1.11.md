---
title: "Ragdoll System v0.1.11: Multi-modal RAG with Enhanced Document Management"
categories:
  - Engineering
tags:
  - Ragdoll
  - Ruby
  - RAG
  - AI
  - PostgreSQL
  - Rails
  - Vector Search
---

### Exciting Release: Ragdoll System Version 0.1.11

As we dive into the details of the Ragdoll System's version 0.1.11 release, let's take a moment to address the elephant in the room: the hype surrounding AI-generated content. Yes, we know the buzzwords can feel overblown, and sometimes it seems like AI has an inflated sense of self-importance—after all, its creators do say that "AI's think their Bravo Sierra does stink." So, forgive me for any overly enthusiastic language. I believe in the potential of this RAG library for the Ruby ecosystem and the benefits it brings to developers—if not as a useful positive example then at best as an example of how not to write software.

It's worth pondering whether Ragdoll and other RAG systems might soon (if not now) be rendered obsolete by the rapid advancements in the AI landscape. Major providers of frontier multi-modal LLMs are now offering their own support for vector stores and cloud-based systems, enabling users to chat seamlessly with their documents. This shift raises questions about the future of independent RAG solutions, as these powerful LLMs integrate document interaction into their core functionalities, making it easier for users to access and utilize their data without needing additional layers of complexity.

The Ragdoll project itself began as an experiment back in January 2025, focusing on the idea of vectorizing various media types using different LLMs and combining them into a single, cohesive system. The goal was to enable multi-modal retrieval, allowing prompts that include text, images, and audio to yield responses that encompass all these formats. As multi-modal capabilities become the norm among leading LLMs, Ragdoll and its ilk may soon become unnecessary.

Warning: don't trust what you read here.  Working on ragdoll was fun for a while, but it's time to move on.  I'm thinking about bringing my SmartMessage project from the past into the future and link it with AI Agents much like what I was thinking about when I release the `agent99` gem.

# 🎉 Ragdoll v0.1.11 Release Announcement

**Multi-modal RAG System with Enhanced Document Management & Search Analytics**

![Ragdoll System](/blog/images/ragdoll.png)

We're excited to announce the release of **Ragdoll v0.1.11**, a significant update to our database-oriented, multi-modal Retrieval-Augmented Generation (RAG) system built on ActiveRecord and PostgreSQL + pgvector.

## 🚀 What's New in v0.1.11

### **Enhanced Document Management**
- **Force Option for Document Addition**: Override duplicate detection when needed with the new `force` parameter
- **Improved Search Flexibility**: Made query embeddings optional for more flexible search operations
- **Better Database Setup**: Enhanced database role handling and configuration procedures

### **Rails Engine Improvements** (ragdoll-rails)
- **Bulk Document Upload**: New bulk upload functionality with session tracking and batch processing
- **Real-time Progress Tracking**: ActionCable integration for live upload progress monitoring
- **Enhanced Search Interface**: Form-based search with both semantic and full-text search options
- **Analytics Dashboard**: Comprehensive search statistics and trending queries
- **Document Selection & Management**: Improved document browsing with selection checkboxes and detailed views

### **Developer Experience**
- **Better Logging**: Safe logging methods and improved consistency across components
- **Job Queue Dashboard**: Monitor background processing jobs
- **Engine Isolation**: Fixed namespace isolation for proper Rails engine behavior

## 🏗️ Architecture Highlights

- **Database-First**: Built on PostgreSQL + pgvector for production performance
- **Multi-Modal Ready**: Text, image, and audio content support via polymorphic architecture
- **Dual Metadata Design**: Separate LLM-generated content analysis from file properties
- **Provider Agnostic**: Supports OpenAI, Anthropic, Google, Azure, Ollama, and more via ruby_llm
- **Search Variety**: Semantic, full-text, and hybrid search capabilities

## 📦 Components & Links

### **Core Components**
- **[ragdoll](https://github.com/madbomber/ragdoll)** - Core RAG library with vector search
- **[ragdoll-rails](https://github.com/madbomber/ragdoll-rails)** - Rails engine with web interface
- **[ragdoll-cli](https://github.com/madbomber/ragdoll-cli)** - Command-line interface
- **[ragdoll-demo](https://github.com/madbomber/ragdoll_demo_app)** - Full-featured demo application

### **Documentation**
- **[Documentation Website](https://github.com/madbomber/ragdoll-docs)** - Comprehensive guides and API reference

## 🛠️ Quick Start

```ruby
# Install the gems
gem install ragdoll ragdoll-rails ragdoll-cli

# Configure with PostgreSQL + pgvector
Ragdoll.configure do |config|
  config.database_config = {
    adapter: 'postgresql',
    database: 'ragdoll_production',
    # ... other config
  }
  config.ruby_llm_config[:openai][:api_key] = ENV['OPENAI_API_KEY']
end

# Add documents with force option (new!)
result = Ragdoll.add_document(path: 'document.pdf', force: true)

# Enhanced search capabilities
results = Ragdoll.hybrid_search(
  query: 'machine learning',
  semantic_weight: 0.7,
  text_weight: 0.3
)
```

## 🔧 For Rails Applications

![Ragdoll Rails Interface](/blog/images/ragdoll-rails.png)

```ruby
# Add to Gemfile
gem 'ragdoll-rails'

# Mount the engine
mount Ragdoll::Rails::Engine => '/ragdoll'

# Visit /ragdoll for full web interface with:
# - Document upload & management
# - Search interface with analytics
# - Real-time progress tracking
# - Job queue monitoring
```

## 📋 Supported Features

- **Document Types**: PDF, DOCX, HTML, Markdown, plain text, JSON, XML, CSV
- **Search Types**: Semantic (vector), Full-text (PostgreSQL), Hybrid (combined)
- **LLM Providers**: OpenAI, Anthropic, Google, Azure, Ollama, HuggingFace
- **Background Processing**: SolidQueue, Sidekiq, ActiveJob compatible
- **Real-time Features**: ActionCable for live updates

## 🎯 Use Cases

- Internal knowledge bases and AI chat assistants
- Product documentation with intelligent search
- Research corpora analysis and exploration
- Incident retrospectives with searchable content
- Media libraries preparing for multi-modal pipelines

## 📊 What's Coming

- **Image Processing**: Vision AI integration (framework ready)
- **Audio Processing**: Speech-to-text integration (framework ready)
- **Multi-modal Search**: Cross-content-type search capabilities
- **Enhanced Analytics**: Advanced search and usage insights

## 🙏 Get Started

![Ragdoll CLI Interface](/blog/images/ragdoll-cli.png)

1. **Try the Demo**: `git clone https://github.com/madbomber/ragdoll_demo_app`
2. **Read the Docs**: Visit the [ragdoll-docs repository](https://madbomber.github.io/ragdoll-docs)
3. **Join the Community**: Open issues and discussions on GitHub

## 🔗 Links

- **[Core Library](https://github.com/madbomber/ragdoll)**
- **[Rails Engine](https://github.com/madbomber/ragdoll-rails)**
- **[CLI Tool](https://github.com/madbomber/ragdoll-cli)**
- **[Demo App](https://github.com/madbomber/ragdoll_demo_app)**
- **[Documentation](https://madbomber.github.io/ragdoll-docs)**
