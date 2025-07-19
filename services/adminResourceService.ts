import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebaseConfig";

export interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  type:
    | "AddictionHelp"
    | "FindTherapist"
    | "Counselling"
    | "Awareness"
    | "SupportSystem";
  contentType: "text" | "image" | "video" | "document";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
  tags?: string[];
  priority?: number;
}

export interface CreateResourceData {
  title: string;
  description: string;
  content: string;
  type: Resource["type"];
  contentType: Resource["contentType"];
  file?: {
    uri: string;
    name: string;
    type: string;
    size: number;
  };
  tags?: string[];
  priority?: number;
}

export async function fetchResources(
  type?: Resource["type"]
): Promise<Resource[]> {
  try {
    let q = collection(db, "resources");

    if (type) {
      q = query(q, where("type", "==", type), where("isActive", "==", true));
    } else {
      q = query(q, where("isActive", "==", true));
    }

    q = query(q, orderBy("priority", "desc"), orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    })) as Resource[];
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw error;
  }
}

export async function fetchResourceById(
  resourceId: string
): Promise<Resource | null> {
  try {
    const docRef = doc(db, "resources", resourceId);
    const docSnap = await getDocs(
      query(collection(db, "resources"), where("__name__", "==", resourceId))
    );

    if (!docSnap.empty) {
      const data = docSnap.docs[0].data();
      return {
        id: docSnap.docs[0].id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Resource;
    }
    return null;
  } catch (error) {
    console.error("Error fetching resource by ID:", error);
    throw error;
  }
}

export async function createResource(
  data: CreateResourceData,
  userId: string
): Promise<{ id: string }> {
  try {
    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let fileType: string | undefined;

    // Upload file if provided
    if (data.file && data.contentType !== "text") {
      const fileRef = ref(storage, `resources/${Date.now()}_${data.file.name}`);
      const response = await fetch(data.file.uri);
      const blob = await response.blob();
      await uploadBytes(fileRef, blob);
      fileUrl = await getDownloadURL(fileRef);
      fileName = data.file.name;
      fileSize = data.file.size;
      fileType = data.file.type;
    }

    const resourceData = {
      title: data.title,
      description: data.description,
      content: data.content,
      type: data.type,
      contentType: data.contentType,
      fileUrl,
      fileName,
      fileSize,
      fileType,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      isActive: true,
      tags: data.tags || [],
      priority: data.priority || 0,
    };

    const docRef = await addDoc(collection(db, "resources"), resourceData);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
}

export async function updateResource(
  resourceId: string,
  data: Partial<CreateResourceData>,
  userId: string
): Promise<boolean> {
  try {
    const resourceRef = doc(db, "resources", resourceId);

    // Get existing resource to check if we need to delete old file
    const existingResource = await fetchResourceById(resourceId);

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let fileType: string | undefined;

    // Upload new file if provided
    if (data.file && data.contentType !== "text") {
      // Delete old file if it exists
      if (existingResource?.fileUrl) {
        try {
          const oldFileRef = ref(storage, existingResource.fileUrl);
          await deleteObject(oldFileRef);
        } catch (error) {
          console.warn("Could not delete old file:", error);
        }
      }

      const fileRef = ref(storage, `resources/${Date.now()}_${data.file.name}`);
      const response = await fetch(data.file.uri);
      const blob = await response.blob();
      await uploadBytes(fileRef, blob);
      fileUrl = await getDownloadURL(fileRef);
      fileName = data.file.name;
      fileSize = data.file.size;
      fileType = data.file.type;
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: userId,
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.contentType !== undefined)
      updateData.contentType = data.contentType;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl;
    if (fileName !== undefined) updateData.fileName = fileName;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (fileType !== undefined) updateData.fileType = fileType;

    await updateDoc(resourceRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating resource:", error);
    throw error;
  }
}

export async function deleteResource(resourceId: string): Promise<boolean> {
  try {
    const resourceRef = doc(db, "resources", resourceId);

    // Get resource to delete associated file
    const resource = await fetchResourceById(resourceId);

    if (resource?.fileUrl) {
      try {
        const fileRef = ref(storage, resource.fileUrl);
        await deleteObject(fileRef);
      } catch (error) {
        console.warn("Could not delete file:", error);
      }
    }

    await deleteDoc(resourceRef);
    return true;
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
}

export async function toggleResourceStatus(
  resourceId: string,
  isActive: boolean
): Promise<boolean> {
  try {
    const resourceRef = doc(db, "resources", resourceId);
    await updateDoc(resourceRef, {
      isActive,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error toggling resource status:", error);
    throw error;
  }
}

export async function searchResources(
  searchTerm: string,
  type?: Resource["type"]
): Promise<Resource[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation - for production, consider using Algolia or similar
    const resources = await fetchResources(type);
    const searchLower = searchTerm.toLowerCase();

    return resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.content.toLowerCase().includes(searchLower) ||
        resource.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error("Error searching resources:", error);
    throw error;
  }
}

export async function getResourceStats(): Promise<{
  total: number;
  byType: Record<Resource["type"], number>;
  byContentType: Record<Resource["contentType"], number>;
}> {
  try {
    const resources = await fetchResources();

    const byType = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1;
      return acc;
    }, {} as Record<Resource["type"], number>);

    const byContentType = resources.reduce((acc, resource) => {
      acc[resource.contentType] = (acc[resource.contentType] || 0) + 1;
      return acc;
    }, {} as Record<Resource["contentType"], number>);

    return {
      total: resources.length,
      byType,
      byContentType,
    };
  } catch (error) {
    console.error("Error getting resource stats:", error);
    throw error;
  }
}
