class Builders::FetchProjects < SiteBuilder
  def build
    hook :site, :before_read do
      projects_file = File.join(site.source, "_data", "projects.yml")
      script_path   = File.join(site.root_dir, "scripts", "find_mkdocs_repos.rb")

      next unless File.exist?(script_path)

      # Skip if projects.yml was updated within the last hour
      if File.exist?(projects_file)
        age_minutes = (Time.now - File.mtime(projects_file)) / 60
        if age_minutes < 60
          Bridgetown.logger.info "FetchProjects:", "projects.yml is #{age_minutes.round}m old, skipping refresh"
          next
        end
      end

      Bridgetown.logger.info "FetchProjects:", "Refreshing project data..."
      system("ruby", script_path)
    end
  end
end
