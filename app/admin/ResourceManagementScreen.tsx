// ResourceManagementScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import AdminHeroBox from '../../components/AdminHeroBox';

type Props = NativeStackScreenProps<AdminStackParamList, 'ResourceManagement'>;

type Resource = {
  id: string;
  title: string;
  description: string;
  type: 'AddictionHelp' | 'FindTherapist' | 'Counselling' | 'Awareness' | 'SupportSystem';
};

const ResourceManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'AddictionHelp' as Resource['type'],
  });

  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Crisis Helpline',
      description: 'Immediate assistance contact numbers.',
      type: 'AddictionHelp',
    },
    {
      id: '2',
      title: 'Therapist Directory',
      description: 'List of certified therapists near you.',
      type: 'FindTherapist',
    },
    {
      id: '3',
      title: 'Virtual Counseling',
      description: 'Access online therapy and support groups.',
      type: 'Counselling',
    },
  ]);

  const resourceTypes: Resource['type'][] = [
    'AddictionHelp',
    'FindTherapist',
    'Counselling',
    'Awareness',
    'SupportSystem',
  ];

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'AddictionHelp' });
    setEditingResource(null);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
    });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeroBox title="Resources" showBackButton customBackRoute="AdminDashboard" />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={26} color="#fff" />
          <Text style={styles.addButtonText}>Add New Resource</Text>
        </TouchableOpacity>

        {resources.map((resource) => (
          <View key={resource.id} style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceType}>{resource.type}</Text>
            </View>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.verifyButton]}
                onPress={() => console.log('Verified:', resource.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(resource)}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => console.log('Delete:', resource.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {resourceTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, formData.type === type && styles.selectedTypeButton]}
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  if (editingResource) {
                    setResources((prev) =>
                      prev.map((r) =>
                        r.id === editingResource.id ? { ...editingResource, ...formData } : r
                      )
                    );
                  } else {
                    setResources((prev) => [
                      ...prev,
                      { id: Date.now().toString(), ...formData },
                    ]);
                  }
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.saveButtonText}>
                  {editingResource ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B6B63',
    padding: 14,
    borderRadius: 25,
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#fff', marginLeft: 10, fontWeight: '600', fontSize: 16 },
  resourceCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1B6B63',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  resourceTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B6B63' },
  resourceType: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  resourceDescription: { fontSize: 15, color: '#444', marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  verifyButton: { backgroundColor: '#4CAF50' },
  editButton: { backgroundColor: '#1E88E5' },
  deleteButton: { backgroundColor: '#D32F2F' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  typeSelector: { flexDirection: 'row', marginBottom: 20 },
  typeButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedTypeButton: { backgroundColor: '#1B6B63' },
  typeButtonText: { color: '#333' },
  selectedTypeButtonText: { color: '#fff' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#e0e0e0' },
  saveButton: { backgroundColor: '#1B6B63' },
  cancelButtonText: { color: '#444', fontWeight: 'bold' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ResourceManagementScreen;
