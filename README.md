# Dewayne VanHoozer - Personal Website

<div align="center">
  <img src="src/images/madbomber_logo_animated.svg" alt="MadBomber Logo" width="450" height="180">
</div>

This repository contains the source code for my professional website at [madbomber.github.io](https://madbomber.github.io).

## Technologies Used

- **Bridgetown 2.1.0**: Modern Ruby static site generator
- **ERB Templates**: Component-based templating
- **esbuild**: Fast JavaScript/CSS bundling
- **GitHub Pages**: Hosting and deployment
- **GitHub Actions**: Automated build and deploy

## Project Structure

```
.
├── config/                 # Configuration files
│   └── initializers.rb     # Site settings (URL, timezone, etc.)
├── frontend/               # Frontend assets
│   ├── javascript/         # JS entry points
│   └── styles/             # CSS files
├── plugins/                # Custom Ruby plugins
├── scripts/                # Utility scripts
│   └── find_mkdocs_repos.rb  # Sync projects from GitHub
├── src/                    # Source content
│   ├── _components/        # Reusable ERB components
│   │   └── shared/         # Shared components (navbar, etc.)
│   ├── _data/              # Data files (YAML)
│   │   ├── site_metadata.yml
│   │   └── projects.yml    # Auto-generated project data
│   ├── _layouts/           # Page layouts
│   ├── _partials/          # Partial templates
│   ├── _posts/             # Blog posts
│   └── images/             # Static images
├── output/                 # Built site (gitignored)
├── Gemfile                 # Ruby dependencies
└── package.json            # Node dependencies
```

## Local Development

### Prerequisites

- Ruby 3.2+ (tested with Ruby 4.0.0)
- Node.js 18+
- Bundler

### Setup

```bash
# Install Ruby dependencies
bundle install

# Install Node dependencies
npm install
```

### Development Server

```bash
bin/bridgetown start
```

The site will be available at `http://localhost:4000` with live reload enabled.

### Build for Production

```bash
bin/bridgetown build
```

Output is written to the `output/` directory.

### Other Commands

```bash
# Run tests
bundle exec rake

# Build frontend assets only
bin/bridgetown frontend:build

# Clean build artifacts
bin/bridgetown clean
```

## Configuration

### Site Metadata

Edit `src/_data/site_metadata.yml` to update:
- Site title and tagline
- Author information
- Navigation links
- Social media links

### Site Settings

Edit `config/initializers.rb` to configure:
- Site URL
- Timezone
- Template engine
- Plugins

## Adding Content

### Pages

Create `.md` or `.erb` files in `src/`:

```markdown
---
layout: page
title: My Page
---

Page content here...
```

### Blog Posts

Create files in `src/_posts/` with the naming convention:

```
YYYY-MM-DD-title-slug.md
```

### Components

Create reusable components in `src/_components/`:

1. Ruby class: `src/_components/shared/my_component.rb`
2. ERB template: `src/_components/shared/my_component.erb`

## Updating Projects from GitHub

The Projects page is dynamically generated from data synced from GitHub repositories. The script scans all non-forked MadBomber repos that contain a `mkdocs.yml` file (indicating documented projects).

### Sync Project Data

```bash
ruby scripts/find_mkdocs_repos.rb
```

This script:
1. Fetches all non-forked repos from github.com/MadBomber
2. Filters for repos containing `mkdocs.yml`
3. Extracts project metadata (name, description, stars, language)
4. Writes to `src/_data/projects.yml`

The Projects page (`src/projects.erb`) automatically renders cards for all projects in this data file, sorted by star count.

### Requirements

- GitHub CLI (`gh`) must be installed and authenticated
- Run periodically to keep project data fresh

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to `main` via GitHub Actions (`.github/workflows/bridgetown.yml`).

## Content Areas

### Professional Focus
- Ruby on Rails development (18+ years)
- Technical leadership and team management
- AI/ML integration and prompt engineering
- Performance optimization and system scaling
- Healthcare technology and government contracts

### Open Source Contributions
- [prompt_manager](https://github.com/MadBomber/prompt_manager): AI prompt management
- [aia](https://github.com/MadBomber/aia): Command-line AI assistant
- [debug_me](https://github.com/MadBomber/debug_me): Ruby debugging utilities
- Multiple additional Ruby gems and tools

### Contact

- **Email**: [dvanhoozer@duck.com](mailto:dvanhoozer@duck.com)
- **LinkedIn**: [linkedin.com/in/dewayne-vanhoozer](https://linkedin.com/in/dewayne-vanhoozer)
- **GitHub**: [github.com/MadBomber](https://github.com/MadBomber)
- **Blog**: [madbomber.github.io/blog](https://madbomber.github.io/blog)

## License

Content is copyright Dewayne VanHoozer. Site code is MIT licensed.
