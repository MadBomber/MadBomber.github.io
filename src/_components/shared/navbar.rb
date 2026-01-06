class Shared::Navbar < Bridgetown::Component
  attr_reader :metadata, :resource

  def initialize(metadata:, resource:)
    @metadata = metadata
    @resource = resource
  end
end
