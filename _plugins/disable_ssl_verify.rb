# Disable SSL verification for local development only
# This is a workaround for Ruby 3.4.7 SSL certificate issues
require 'openssl'

if Jekyll.env == 'development' || ENV['JEKYLL_ENV'] != 'production'
  OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:verify_mode] = OpenSSL::SSL::VERIFY_NONE
end
