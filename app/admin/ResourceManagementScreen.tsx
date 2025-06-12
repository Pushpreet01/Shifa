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

  const resources: Resource[] = [
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
  ];

  const resourceTypes: Resource['type'][] = [
    'AddictionHelp',
    'FindTherapist',
    'Counselling',
    'Awareness',
    'SupportSystem',
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'AddictionHelp',
    });
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
          <Ionicons name="add-circle-outline" size={24} color="#1B6B63" />
          <Text style={styles.addButtonText}>Add Resource</Text>
        </TouchableOpacity>

        {resources.map((resource) => (
          <View key={resource.id} style={styles.resourceCard}>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceType}>{resource.type}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.verifyButton]}
                onPress={() => console.log('Verified:', resource.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={22} color="#2E7D32" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(resource)}
              >
                <Ionicons name="create-outline" size={20} color="#1B6B63" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => console.log('Delete:', resource.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#C44536" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
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
                  console.log('Saved:', formData);
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#1B6B63', marginLeft: 8, fontWeight: '600', fontSize: 16 },
  resourceCard: {
    backgroundColor: '#FDF6EC',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  resourceInfo: { marginBottom: 12 },
  resourceTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B6B63' },
  resourceType: { fontSize: 14, color: '#888', marginBottom: 6 },
  resourceDescription: { fontSize: 14, color: '#444' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  editButton: { backgroundColor: '#DFF7F4' },
  deleteButton: { backgroundColor: '#FCE8E8' },
  verifyButton: { backgroundColor: '#E2F4EA' },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedTypeButton: {
    backgroundColor: '#1B6B63',
  },
  typeButtonText: {
    color: '#666',
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#1B6B63',
  },
  cancelButtonText: {
    color: '#444',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ResourceManagementScreen;
