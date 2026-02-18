class Blog::SeriesNav < Bridgetown::Component
  attr_reader :series_data, :current_url

  def initialize(series_data:, current_url:)
    @series_data = series_data
    @current_url = current_url
  end
end
