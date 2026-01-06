#!/usr/bin/env ruby
# Find all MadBomber repos with mkdocs.yml files

require 'json'
require 'open3'
require 'yaml'
require 'base64'
require 'net/http'
require 'uri'

# Fetch RubyGems download count for a gem
def fetch_rubygems_downloads(gem_name)
  # Convert repo name to gem name (replace - with _ for some gems)
  gem_names_to_try = [
    gem_name,
    gem_name.tr('-', '_'),
    gem_name.tr('_', '-')
  ].uniq

  gem_names_to_try.each do |name|
    uri = URI("https://rubygems.org/api/v1/gems/#{name}.json")
    begin
      response = Net::HTTP.get_response(uri)
      if response.is_a?(Net::HTTPSuccess)
        data = JSON.parse(response.body)
        return {
          downloads: data['downloads'],
          gem_name: data['name'],
          version: data['version'],
          version_date: data['version_created_at']
        }
      end
    rescue => e
      # Continue to next name variant
    end
  end

  nil
end

# Format download count with commas
def format_downloads(count)
  return '0' unless count
  count.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
end

# Get all non-forked repos
repos_json, status = Open3.capture2('gh', 'repo', 'list', 'MadBomber',
  '--limit', '200',
  '--json', 'name,isFork,description,url,homepageUrl,stargazerCount,updatedAt,primaryLanguage')

repos = JSON.parse(repos_json).reject { |r| r['isFork'] }

puts "Found #{repos.size} non-forked repos"
puts

mkdocs_repos = []

repos.each do |repo|
  name = repo['name']
  # Check if mkdocs.yml exists
  result, stderr, status = Open3.capture3('gh', 'api', "repos/MadBomber/#{name}/contents/mkdocs.yml")

  if status.success?
    puts "✓ #{name} has mkdocs.yml"

    begin
      content_json = JSON.parse(result)
      if content_json['content']
        mkdocs_content = Base64.decode64(content_json['content'])
        mkdocs_yaml = YAML.safe_load(mkdocs_content) rescue {}

        # Fetch RubyGems data
        rubygems_data = fetch_rubygems_downloads(name)
        if rubygems_data
          puts "  → RubyGems: #{rubygems_data[:gem_name]} v#{rubygems_data[:version]} (#{format_downloads(rubygems_data[:downloads])} downloads)"
        else
          puts "  → Not found on RubyGems"
        end

        mkdocs_repos << {
          name: name,
          description: repo['description'],
          url: repo['url'],
          homepage: repo['homepageUrl'],
          stars: repo['stargazerCount'],
          updated_at: repo['updatedAt'],
          language: repo.dig('primaryLanguage', 'name'),
          mkdocs: mkdocs_yaml,
          rubygems: rubygems_data
        }
      end
    rescue JSON::ParserError => e
      puts "  Warning: Could not parse mkdocs.yml content for #{name}"
    end
  end
end

puts
puts "=" * 60
puts "Repos with mkdocs.yml: #{mkdocs_repos.size}"
puts "=" * 60

mkdocs_repos.each do |repo|
  puts
  puts "Name: #{repo[:name]}"
  puts "Description: #{repo[:description]}"
  puts "URL: #{repo[:url]}"
  puts "Homepage: #{repo[:homepage]}"
  puts "Downloads: #{repo[:rubygems] ? format_downloads(repo[:rubygems][:downloads]) : 'N/A'}"
  puts "Language: #{repo[:language]}"
  puts "Site Name: #{repo[:mkdocs]['site_name']}" if repo[:mkdocs]['site_name']
  puts "Site Description: #{repo[:mkdocs]['site_description']}" if repo[:mkdocs]['site_description']
end

# Output as YAML for use in Bridgetown
output_file = File.join(__dir__, '..', 'src', '_data', 'projects.yml')
projects_data = mkdocs_repos.map do |repo|
  {
    'name' => repo[:mkdocs]['site_name'] || repo[:name],
    'repo_name' => repo[:name],
    'description' => repo[:mkdocs]['site_description'] || repo[:description],
    'github_url' => repo[:url],
    'docs_url' => repo[:homepage].to_s.empty? ? "https://madbomber.github.io/#{repo[:name]}/" : repo[:homepage],
    'downloads' => repo[:rubygems]&.dig(:downloads) || 0,
    'gem_name' => repo[:rubygems]&.dig(:gem_name),
    'gem_version' => repo[:rubygems]&.dig(:version),
    'gem_version_date' => repo[:rubygems]&.dig(:version_date),
    'language' => repo[:language],
    'updated_at' => repo[:updated_at]
  }
end

# Sort by downloads descending
projects_data.sort_by! { |p| -(p['downloads'] || 0) }

File.write(output_file, projects_data.to_yaml)
puts
puts "Wrote #{projects_data.size} projects to #{output_file}"
