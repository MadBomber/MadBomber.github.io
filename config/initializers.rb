# Welcome to Bridgetown!
#
# This configuration file is for settings which affect your whole site.
#
# For more documentation on using this initializers file, visit:
# https://www.bridgetownrb.com/docs/configuration/initializers/
#
# A list of all available configuration options can be found here:
# https://www.bridgetownrb.com/docs/configuration/options
#
# For technical reasons, this file is *NOT* reloaded automatically when you use
# `bin/bridgetown start`. If you change this file, please restart the server process.
#
# For reloadable site metadata like title, SEO description, social media
# handles, etc., take a look at `src/_data/site_metadata.yml`

Bridgetown.configure do |config|
  url "https://madbomber.github.io"
  template_engine "erb"
  timezone "America/Chicago"

  permalink "/blog/:categories/:title/"

  pagination do
    enabled true
  end
end
