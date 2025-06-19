import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AdminHeroBox from '../../components/AdminHeroBox';

type Resource = {
  id: string;
  title: string;
  description: string;
  type: 'AddictionHelp' | 'FindTherapist' | 'Counselling' | 'Awareness' | 'SupportSystem';
};

const iconMap: Record<Resource['type'], JSX.Element> = {
  AddictionHelp: <MaterialCommunityIcons name="hand-heart" size={20} color="#fff" />,
  FindTherapist: <Ionicons name="people-circle" size={20} color="#fff" />,
  Counselling: <FontAwesome5 name="comments" size={18} color="#fff" />,
  Awareness: <Ionicons name="megaphone-outline" size={20} color="#fff" />,
  SupportSystem: <Ionicons name="people" size={20} color="#fff" />,
};

const ResourceManagementScreen = () => {
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

  const [modalVisible, setModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'AddictionHelp' as Resource['type'],
  });

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
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Resource</Text>
        </TouchableOpacity>

        {resources.map((resource) => (
          <View key={resource.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                {iconMap[resource.type]}
              </View>
              <Text style={styles.cardTitle}>{resource.title}</Text>
            </View>
            <Text style={styles.cardDescription}>{resource.description}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={[styles.iconBtn, styles.verifyBtn]}>
                <Ionicons name="checkmark-outline" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.editBtn]}
                onPress={() => openEditModal(resource)}
              >
                <Ionicons name="pencil-outline" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.deleteBtn]}
                onPress={() => console.log('Deleted:', resource.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingResource ? 'Edit Resource' : 'Add Resource'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
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
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
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
                <Text style={styles.saveText}>{editingResource ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EC' },
  content: { padding: 20 },
  addButton: {
    backgroundColor: '#1B6B63',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: { color: '#fff', fontSize: 16, marginLeft: 10, fontWeight: 'bold' },
  card: {
    backgroundColor: '#FDF6EC',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B6B63',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 15,
    color: '#444',
    marginTop: 6,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e5a54e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 14,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
  verifyBtn: { backgroundColor: '#008080' },
  editBtn: { backgroundColor: '#008080' },
  deleteBtn: { backgroundColor: '#008080' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B6B63',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
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
    backgroundColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedTypeButton: {
    backgroundColor: '#1B6B63',
  },
  typeButtonText: {
    color: '#444',
  },
  selectedTypeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ccc',
  },
  saveBtn: {
    backgroundColor: '#1B6B63',
  },
  cancelText: { color: '#333', fontWeight: '600' },
  saveText: { color: '#fff', fontWeight: '600' },
});

export default ResourceManagementScreen;
