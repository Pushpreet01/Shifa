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

  // Placeholder data
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Crisis Helpline Information',
      description: 'Emergency contact numbers and resources for immediate assistance',
      type: 'AddictionHelp',
    },
    {
      id: '2',
      title: 'Licensed Therapists Directory',
      description: 'Find certified mental health professionals in your area',
      type: 'FindTherapist',
    },
    {
      id: '3',
      title: 'Online Counseling Services',
      description: 'Access to virtual counseling sessions and support groups',
      type: 'Counselling',
    },
    {
      id: '4',
      title: 'Mental Health Education',
      description: 'Educational resources about mental health and well-being',
      type: 'Awareness',
    },
    {
      id: '5',
      title: 'Community Support Groups',
      description: 'Local support groups and community resources',
      type: 'SupportSystem',
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

      <ScrollView style={styles.content}>
        <View style={styles.addButtonContainer}>
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
        </View>

        {resources.map((resource) => (
          <View key={resource.id} style={styles.resourceCard}>
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceType}>{resource.type}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
            </View>
            <View style={styles.actionButtons}>
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

      {/* Add/Edit Modal */}
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
              numberOfLines={4}
            />

            <ScrollView horizontal style={styles.typeSelector}>
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
                  console.log('Save:', formData);
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroBox: {
    backgroundColor: '#FDF6EC',
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1B6B63',
  },
  content: {
    flex: 1,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#1B6B63',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  resourceCard: {
    backgroundColor: '#FDF6EC',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 4,
  },
  resourceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#444',
  },
  actionButtons: {
    justifyContent: 'space-around',
    paddingLeft: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  editButton: {
    backgroundColor: '#E0F2F1',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: '#1B6B63',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 14,
  },
  selectedTypeButtonText: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#1B6B63',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ResourceManagementScreen; 