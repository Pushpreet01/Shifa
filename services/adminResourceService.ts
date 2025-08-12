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
  Query,
  DocumentData,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

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
  updatedBy?: string;
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

async function uploadFileToCloudinary(file: { uri: string; type: string; name: string; }) {
  const formData = new FormData();
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary environment variables are not configured. Please check your .env file.");
  }

  let resourceType = 'raw';
  if (file.type.startsWith('image/')) {
    resourceType = 'image';
  } else if (file.type.startsWith('video/')) {
    resourceType = 'video';
  }

  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const result = await response.json();
    if (result.secure_url) {
      return result;
    } else {
      console.error("Cloudinary Error:", result.error);
      throw new Error('Cloudinary upload failed: ' + (result.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export async function fetchAllResources(
  type?: Resource["type"]
): Promise<Resource[]> {
  try {
    const queries = [];
    const baseQuery = collection(db, "resources");

    const activeQuery = query(baseQuery, where("isActive", "==", true));
    const inactiveQuery = query(baseQuery, where("isActive", "==", false));

    if (type) {
      queries.push(query(activeQuery, where("type", "==", type), orderBy("priority", "desc"), orderBy("createdAt", "desc")));
      queries.push(query(inactiveQuery, where("type", "==", type), orderBy("priority", "desc"), orderBy("createdAt", "desc")));
    } else {
      queries.push(query(activeQuery, orderBy("priority", "desc"), orderBy("createdAt", "desc")));
      queries.push(query(inactiveQuery, orderBy("priority", "desc"), orderBy("createdAt", "desc")));
    }

    const snapshots = await Promise.all(queries.map(q => getDocs(q)));
    
    const resources = snapshots.flatMap(snapshot => 
      snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Resource;
      })
    );

    resources.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      if (a.createdAt && b.createdAt) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return 0;
    });

    return resources;
  } catch (error) {
    console.error("Error fetching all resources:", error);
    throw error;
  }
}

export async function fetchResources(
  type?: Resource["type"]
): Promise<Resource[]> {
  try {
    let resourcesQuery: Query<DocumentData> = collection(db, "resources");

    if (type) {
      resourcesQuery = query(
        resourcesQuery,
        where("type", "==", type),
        where("isActive", "==", true)
      );
    } else {
      resourcesQuery = query(
        resourcesQuery,
        where("isActive", "==", true)
      );
    }

    resourcesQuery = query(
      resourcesQuery,
      orderBy("priority", "desc"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(resourcesQuery);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Resource;
    });
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
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
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

    if (data.file && data.contentType !== "text") {
      const uploadResult = await uploadFileToCloudinary(data.file);
      fileUrl = uploadResult.secure_url;
      fileName = uploadResult.original_filename;
      fileSize = uploadResult.bytes;
      fileType = uploadResult.resource_type;
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

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let fileType: string | undefined;

    if (data.file && data.contentType !== "text") {
      // Note: Deleting the old file from Cloudinary is not implemented
      // to keep the client-side logic simple and avoid extra permissions.
      const uploadResult = await uploadFileToCloudinary(data.file);
      fileUrl = uploadResult.secure_url;
      fileName = uploadResult.original_filename;
      fileSize = uploadResult.bytes;
      fileType = uploadResult.resource_type;
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
    // Note: Deleting the associated file from Cloudinary is not implemented
    // as it requires more advanced setup (e.g., backend functions).
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
    const resources = await fetchAllResources(type);
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
    const resources = await fetchAllResources();

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
