import { fetchResources, Resource } from "./adminResourceService";

export interface UserResource extends Resource {
  // Additional fields specific to user view
  isBookmarked?: boolean;
  viewCount?: number;
}

export async function getUserResources(
  type?: Resource["type"]
): Promise<UserResource[]> {
  try {
    // Only fetch active resources for users
    const resources = await fetchResources(type);

    // Transform to user-friendly format
    return resources.map((resource) => ({
      ...resource,
      isBookmarked: false, // This would be fetched from user's bookmarks
      viewCount: 0, // This would be tracked separately
    }));
  } catch (error) {
    console.error("Error fetching user resources:", error);
    throw error;
  }
}

export async function searchUserResources(
  searchTerm: string,
  type?: Resource["type"]
): Promise<UserResource[]> {
  try {
    const resources = await fetchResources(type);
    const searchLower = searchTerm.toLowerCase();

    const filteredResources = resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.content.toLowerCase().includes(searchLower) ||
        resource.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );

    return filteredResources.map((resource) => ({
      ...resource,
      isBookmarked: false,
      viewCount: 0,
    }));
  } catch (error) {
    console.error("Error searching user resources:", error);
    throw error;
  }
}

export async function getResourcesByCategory(
  category: Resource["type"]
): Promise<UserResource[]> {
  try {
    return await getUserResources(category);
  } catch (error) {
    console.error("Error fetching resources by category:", error);
    throw error;
  }
}

export async function getFeaturedResources(): Promise<UserResource[]> {
  try {
    const allResources = await fetchResources();

    // Get resources with high priority (featured)
    const featuredResources = allResources
      .filter((resource) => resource.priority && resource.priority >= 7)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5); // Limit to 5 featured resources

    return featuredResources.map((resource) => ({
      ...resource,
      isBookmarked: false,
      viewCount: 0,
    }));
  } catch (error) {
    console.error("Error fetching featured resources:", error);
    throw error;
  }
}

export async function getRecentResources(
  limit: number = 10
): Promise<UserResource[]> {
  try {
    const allResources = await fetchResources();

    // Sort by creation date and limit
    const recentResources = allResources
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return recentResources.map((resource) => ({
      ...resource,
      isBookmarked: false,
      viewCount: 0,
    }));
  } catch (error) {
    console.error("Error fetching recent resources:", error);
    throw error;
  }
}

export async function getResourcesByContentType(
  contentType: Resource["contentType"]
): Promise<UserResource[]> {
  try {
    const allResources = await fetchResources();

    const filteredResources = allResources.filter(
      (resource) => resource.contentType === contentType
    );

    return filteredResources.map((resource) => ({
      ...resource,
      isBookmarked: false,
      viewCount: 0,
    }));
  } catch (error) {
    console.error("Error fetching resources by content type:", error);
    throw error;
  }
}
