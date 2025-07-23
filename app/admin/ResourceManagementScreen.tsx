import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Video } from "expo-av";
import AdminHeroBox from "../../components/AdminHeroBox";
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  toggleResourceStatus,
  searchResources,
  getResourceStats,
  Resource,
  CreateResourceData,
} from "../../services/adminResourceService";
import { auth } from "../../config/firebaseConfig";

const { width } = Dimensions.get("window");

const iconMap: Record<Resource["type"], JSX.Element> = {
  AddictionHelp: (
    <MaterialCommunityIcons name="hand-heart" size={20} color="#fff" />
  ),
  FindTherapist: <Ionicons name="people-circle" size={20} color="#fff" />,
  Counselling: <FontAwesome5 name="comments" size={18} color="#fff" />,
  Awareness: <Ionicons name="megaphone-outline" size={20} color="#fff" />,
  SupportSystem: <Ionicons name="people" size={20} color="#fff" />,
};

const contentTypeMap: Record<
  Resource["contentType"],
  { icon: string; label: string }
> = {
  text: { icon: "document-text-outline", label: "Text" },
  image: { icon: "image-outline", label: "Image" },
  video: { icon: "videocam-outline", label: "Video" },
  document: { icon: "document-outline", label: "Document" },
};

const ResourceManagementScreen = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<Resource["type"] | "all">(
    "all"
  );
  const [stats, setStats] = useState<any>(null);

  const [formData, setFormData] = useState<CreateResourceData>({
    title: "",
    description: "",
    content: "",
    type: "AddictionHelp",
    contentType: "text",
    tags: [],
    priority: 0,
  });

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);

  const resourceTypes: Resource["type"][] = [
    "AddictionHelp",
    "FindTherapist",
    "Counselling",
    "Awareness",
    "SupportSystem",
  ];

  const contentTypeOptions: Resource["contentType"][] = [
    "text",
    "image",
    "video",
    "document",
  ];

  useEffect(() => {
    loadResources();
    loadStats();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await fetchResources();
      setResources(fetchedResources);
    } catch (error) {
      console.error("Error loading resources:", error);
      Alert.alert("Error", "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const resourceStats = await getResourceStats();
      setStats(resourceStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      type: "AddictionHelp",
      contentType: "text",
      tags: [],
      priority: 0,
    });
    setSelectedFile(null);
    setEditingResource(null);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      content: resource.content,
      type: resource.type,
      contentType: resource.contentType,
      tags: resource.tags || [],
      priority: resource.priority || 0,
    });
    setSelectedFile(null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: `image_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: asset.fileSize || 0,
        });
        setFormData({ ...formData, contentType: "image" });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: `video_${Date.now()}.mp4`,
          type: "video/mp4",
          size: asset.fileSize || 0,
        });
        setFormData({ ...formData, contentType: "video" });
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to pick video");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
          size: asset.size || 0,
        });
        setFormData({ ...formData, contentType: "document" });
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleFileSelection = () => {
    Alert.alert(
      "Select Content Type",
      "Choose the type of content you want to upload",
      [
        { text: "Image", onPress: pickImage },
        { text: "Video", onPress: pickVideo },
        { text: "Document", onPress: pickDocument },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.contentType !== "text" && !selectedFile) {
      Alert.alert("Error", "Please select a file for this content type");
      return;
    }

    try {
      setUploading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      const resourceData: CreateResourceData = {
        ...formData,
        file: selectedFile || undefined,
      };

      if (editingResource) {
        await updateResource(editingResource.id, resourceData, currentUser.uid);
        Alert.alert("Success", "Resource updated successfully");
      } else {
        await createResource(resourceData, currentUser.uid);
        Alert.alert("Success", "Resource created successfully");
      }

      setModalVisible(false);
      resetForm();
      loadResources();
      loadStats();
    } catch (error) {
      console.error("Error saving resource:", error);
      Alert.alert("Error", "Failed to save resource");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    Alert.alert(
      "Delete Resource",
      `Are you sure you want to delete "${resource.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteResource(resource.id);
              Alert.alert("Success", "Resource deleted successfully");
              loadResources();
              loadStats();
            } catch (error) {
              console.error("Error deleting resource:", error);
              Alert.alert("Error", "Failed to delete resource");
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (resource: Resource) => {
    try {
      await toggleResourceStatus(resource.id, !resource.isActive);
      Alert.alert(
        "Success",
        `Resource ${
          resource.isActive ? "deactivated" : "activated"
        } successfully`
      );
      loadResources();
      loadStats();
    } catch (error) {
      console.error("Error toggling resource status:", error);
      Alert.alert("Error", "Failed to update resource status");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadResources();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchResources(
        searchTerm,
        selectedType === "all" ? undefined : selectedType
      );
      setResources(searchResults);
    } catch (error) {
      console.error("Error searching resources:", error);
      Alert.alert("Error", "Failed to search resources");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    if (selectedFile.type.startsWith("image/")) {
      return (
        <View style={styles.filePreview}>
          <Image
            source={{ uri: selectedFile.uri }}
            style={styles.imagePreview}
          />
          <Text style={styles.fileInfo}>{selectedFile.name}</Text>
          <Text style={styles.fileInfo}>
            {formatFileSize(selectedFile.size)}
          </Text>
        </View>
      );
    }

    if (selectedFile.type.startsWith("video/")) {
      return (
        <View style={styles.filePreview}>
          <Video
            source={{ uri: selectedFile.uri }}
            style={styles.videoPreview}
            useNativeControls
            resizeMode="contain"
          />
          <Text style={styles.fileInfo}>{selectedFile.name}</Text>
          <Text style={styles.fileInfo}>
            {formatFileSize(selectedFile.size)}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.filePreview}>
        <Ionicons name="document-outline" size={48} color="#1B6B63" />
        <Text style={styles.fileInfo}>{selectedFile.name}</Text>
        <Text style={styles.fileInfo}>{formatFileSize(selectedFile.size)}</Text>
      </View>
    );
  };

  const renderResourceContent = (resource: Resource) => {
    if (resource.contentType === "image" && resource.fileUrl) {
      return (
        <Image
          source={{ uri: resource.fileUrl }}
          style={styles.resourceImage}
        />
      );
    }

    if (resource.contentType === "video" && resource.fileUrl) {
      return (
        <Video
          source={{ uri: resource.fileUrl }}
          style={styles.resourceVideo}
          useNativeControls
          resizeMode="contain"
        />
      );
    }

    if (resource.contentType === "document" && resource.fileUrl) {
      return (
        <TouchableOpacity style={styles.documentPreview}>
          <Ionicons name="document-outline" size={24} color="#1B6B63" />
          <Text style={styles.documentName}>{resource.fileName}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <Text style={styles.resourceContent} numberOfLines={3}>
        {resource.content}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox
        title="Resources"
        showBackButton
        customBackRoute="AdminDashboard"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Section */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Resource Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Resources</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.byContentType.text || 0}
                </Text>
                <Text style={styles.statLabel}>Text</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.byContentType.image || 0}
                </Text>
                <Text style={styles.statLabel}>Images</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.byContentType.video || 0}
                </Text>
                <Text style={styles.statLabel}>Videos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedType === "all" && styles.selectedFilterButton,
            ]}
            onPress={() => setSelectedType("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedType === "all" && styles.selectedFilterButtonText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {resourceTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.selectedFilterButton,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedType === type && styles.selectedFilterButtonText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Resource</Text>
        </TouchableOpacity>

        {/* Resources List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1B6B63" />
            <Text style={styles.loadingText}>Loading resources...</Text>
          </View>
        ) : resources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No resources found</Text>
          </View>
        ) : (
          resources.map((resource) => (
            <View
              key={resource.id}
              style={[styles.card, !resource.isActive && styles.inactiveCard]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badge}>{iconMap[resource.type]}</View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{resource.title}</Text>
                  <View style={styles.contentTypeBadge}>
                    <Ionicons
                      name={contentTypeMap[resource.contentType].icon as any}
                      size={12}
                      color="#666"
                    />
                    <Text style={styles.contentTypeText}>
                      {contentTypeMap[resource.contentType].label}
                    </Text>
                  </View>
                </View>
                <View style={styles.statusIndicator}>
                  <View
                    style={[
                      styles.statusDot,
                      resource.isActive ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.cardDescription}>{resource.description}</Text>

              {renderResourceContent(resource)}

              {resource.tags && resource.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {resource.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.iconBtn,
                    resource.isActive
                      ? styles.deactivateBtn
                      : styles.activateBtn,
                  ]}
                  onPress={() => handleToggleStatus(resource)}
                >
                  <Ionicons
                    name={resource.isActive ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, styles.editBtn]}
                  onPress={() => openEditModal(resource)}
                >
                  <Ionicons name="pencil-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(resource)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingResource ? "Edit Resource" : "Add Resource"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title *"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description *"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Content *"
              multiline
              value={formData.content}
              onChangeText={(text) =>
                setFormData({ ...formData, content: text })
              }
            />

            <Text style={styles.sectionTitle}>Content Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.contentTypeSelector}
            >
              {contentTypeOptions.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.contentTypeButton,
                    formData.contentType === type &&
                      styles.selectedContentTypeButton,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, contentType: type })
                  }
                >
                  <Ionicons
                    name={contentTypeMap[type].icon as any}
                    size={16}
                    color={formData.contentType === type ? "#fff" : "#666"}
                  />
                  <Text
                    style={[
                      styles.contentTypeButtonText,
                      formData.contentType === type &&
                        styles.selectedContentTypeButtonText,
                    ]}
                  >
                    {contentTypeMap[type].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {formData.contentType !== "text" && (
              <View style={styles.fileSection}>
                <Text style={styles.sectionTitle}>File</Text>
                {selectedFile ? (
                  <View style={styles.selectedFileContainer}>
                    {renderFilePreview()}
                    <TouchableOpacity
                      style={styles.removeFileButton}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.filePickerButton}
                    onPress={handleFileSelection}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color="#1B6B63"
                    />
                    <Text style={styles.filePickerText}>Select File</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.sectionTitle}>Resource Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeSelector}
            >
              {resourceTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.selectedTypeButton,
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.selectedTypeButtonText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Tags (comma separated)"
              value={formData.tags?.join(", ") || ""}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  tags: text
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Priority (0-10)"
              value={formData.priority?.toString() || "0"}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  priority: parseInt(text) || 0,
                })
              }
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                disabled={uploading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.saveBtn,
                  uploading && styles.disabledBtn,
                ]}
                onPress={handleSave}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>
                    {editingResource ? "Update" : "Save"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF6EC" },
  content: { padding: 20 },

  // Stats Section
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B6B63",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B6B63",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  // Search and Filter
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#1B6B63",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedFilterButton: {
    backgroundColor: "#1B6B63",
    borderColor: "#1B6B63",
  },
  filterButtonText: {
    color: "#666",
    fontSize: 14,
  },
  selectedFilterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Add Button
  addButton: {
    backgroundColor: "#1B6B63",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 25,
    justifyContent: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },

  // Loading and Empty States
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
  },

  // Resource Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B6B63",
  },
  contentTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  contentTypeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  statusIndicator: {
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: "#4CAF50",
  },
  inactiveDot: {
    backgroundColor: "#FF9800",
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e5a54e",
    alignItems: "center",
    justifyContent: "center",
  },
  cardDescription: {
    fontSize: 15,
    color: "#444",
    marginBottom: 12,
  },
  resourceContent: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  resourceImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  resourceVideo: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  documentPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#1976d2",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
  activateBtn: { backgroundColor: "#4CAF50" },
  deactivateBtn: { backgroundColor: "#FF9800" },
  editBtn: { backgroundColor: "#1B6B63" },
  deleteBtn: { backgroundColor: "#f44336" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "90%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B6B63",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B6B63",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  // Content Type Selector
  contentTypeSelector: {
    marginBottom: 16,
  },
  contentTypeButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedContentTypeButton: {
    backgroundColor: "#1B6B63",
  },
  contentTypeButtonText: {
    color: "#666",
    marginLeft: 4,
    fontSize: 14,
  },
  selectedContentTypeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // File Section
  fileSection: {
    marginBottom: 16,
  },
  filePickerButton: {
    borderWidth: 2,
    borderColor: "#1B6B63",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  filePickerText: {
    marginTop: 8,
    color: "#1B6B63",
    fontSize: 16,
  },
  selectedFileContainer: {
    position: "relative",
  },
  filePreview: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  videoPreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  removeFileButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  // Type Selector
  typeSelector: {
    marginBottom: 16,
  },
  typeButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: "#1B6B63",
  },
  typeButtonText: {
    color: "#666",
    fontSize: 14,
  },
  selectedTypeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 6,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#ccc",
  },
  saveBtn: {
    backgroundColor: "#1B6B63",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  cancelText: { color: "#333", fontWeight: "600" },
  saveText: { color: "#fff", fontWeight: "600" },
});

export default ResourceManagementScreen;
