class Blog::PostCard < Bridgetown::Component
  attr_reader :post

  def initialize(post:)
    @post = post
  end

  def read_time
    (post.content.split.size / 200.0).ceil
  end

  def excerpt
    text = post.content.gsub(/<[^>]+>/, '').gsub(/\s+/, ' ').strip
    text.length > 160 ? "#{text[0..157]}..." : text
  end
end
