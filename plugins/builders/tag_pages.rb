class Builders::TagPages < SiteBuilder
  def build
    generator do
      tag_map = {}

      site.collections.posts.resources.each do |post|
        (post.data.tags || []).each do |tag|
          tag_map[tag] ||= []
          tag_map[tag] << post
        end
      end

      tag_map.each do |tag, posts|
        slug = tag.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")

        add_resource :pages, "blog/tags/#{slug}.erb" do
          layout    "blog_default"
          title     "Posts tagged \"#{tag}\""
          permalink "/blog/tags/#{slug}/"
          tag_name  tag
          tag_slug  slug
          template_engine "erb"
          content <<~ERB
            <h1>Posts tagged &ldquo;<%= data.tag_name %>&rdquo;</h1>
            <p class="tag-back"><a href="/blog/tags/">&larr; All tags</a></p>

            <%
              posts = collections.posts.resources
                .select { |p| (p.data.tags || []).include?(data.tag_name) }
                .sort_by(&:date).reverse
            %>

            <div class="archive-section">
              <% posts.each do |post| %>
                <%= render Blog::PostCard.new(post: post) %>
              <% end %>
            </div>
          ERB
        end
      end
    end
  end
end
