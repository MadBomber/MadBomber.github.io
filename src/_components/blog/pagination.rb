class Blog::Pagination < Bridgetown::Component
  attr_reader :paginator

  def initialize(paginator:)
    @paginator = paginator
  end
end
