class Builders::CategoryPages < SiteBuilder
  def build
    generator do
      cat_map = {}

      site.collections.posts.resources.each do |post|
        (post.data.categories || []).each do |cat|
          cat_map[cat] ||= []
          cat_map[cat] << post
        end
      end

      cat_map.each do |category, posts|
        slug = category.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")

        add_resource :pages, "blog/categories/#{slug}.erb" do
          layout          "blog_default"
          title           category
          permalink        "/blog/categories/#{slug}/"
          category_name    category
          category_slug    slug
          template_engine  "erb"
          content <<~ERB
            <h1><%= data.category_name %></h1>
            <% cat_meta = site.data.categories[data.category_name] %>
            <% if cat_meta && cat_meta["description"] %>
              <p class="category-description"><%= cat_meta["description"] %></p>
            <% end %>
            <p class="tag-back"><a href="/blog/categories/">&larr; All categories</a></p>

            <%
              posts = collections.posts.resources
                .select { |p| (p.data.categories || []).include?(data.category_name) }
                .sort_by(&:date).reverse
            %>

            <p class="category-count"><%= posts.size %> posts</p>

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
