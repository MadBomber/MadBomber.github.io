class Blog::AuthorSidebar < Bridgetown::Component
  attr_reader :metadata

  def initialize(metadata:)
    @metadata = metadata
  end

  def author
    metadata.author
  end
end
