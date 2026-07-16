import AddPropertyPopup from '@/components/dashboard/AddPropertyPopup';
import Button from '@/components/Button';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import EmptyText from '@/components/EmptyText';
import InfoPopup from '@/components/InfoPopup';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import PropertyScrollRow from '@/components/dashboard/PropertyScrollRow';
import RenameModal from '@/components/RenameModal';
import SelectionActions from '@/components/SelectionActions';
import { useSelectionMode } from '@/hooks/useSelectionMode';
import { supabase } from '@/services/supabase';
import { deleteProperties, fetchProperties, renameProperty } from '@/services/propertyService';
import { useTheme } from '@/theme/ThemeContext';
import { Property } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function PropertiesScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [renamingProperty, setRenamingProperty] = useState<Property | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sel = useSelectionMode();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/(auth)/login'); return; }
      setUserId(data.user.id);
      loadProperties(data.user.id);
    });
  }, []);

  const loadProperties = async (uid: string) => {
    setLoading(true);
    setProperties(await fetchProperties(uid));
    setLoading(false);
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!renamingProperty) return;
    await renameProperty(renamingProperty.id, newName);
    setProperties((prev) => prev.map((p) => p.id === renamingProperty.id ? { ...p, name: newName } : p));
    setRenamingProperty(null);
  };

  const handleDeleteConfirm = async (cascade?: boolean) => {
    const count = pendingDeleteIds.length;
    setDeleteLoading(true);
    await deleteProperties(pendingDeleteIds, cascade ?? true);
    setProperties((prev) => prev.filter((p) => !pendingDeleteIds.includes(p.id)));
    setPendingDeleteIds([]);
    sel.cancel();
    setDeleteLoading(false);
    setSuccessMessage(count === 1 ? 'Property deleted' : `${count} properties deleted`);
  };

  const pendingDeleteName = properties.find((p) => p.id === pendingDeleteIds[0])?.name;

  return (
    <PageContainer>
      <PageHeader
        title="My Properties"
        subtitle="Manage your properties and everything linked to them."
        right={sel.selectionMode ? (
          <SelectionActions
            selectedCount={sel.selectedIds.length}
            onCancel={sel.cancel}
            onDelete={() => {
              if (sel.selectedIds.length > 0) setPendingDeleteIds(sel.selectedIds);
            }}
          />
        ) : (
          <Button
            title="Add Property"
            variant="primary"
            size="sm"
            leftIcon={<MaterialIcons name="add" size={16} color={colors.textInverse} />}
            onPress={() => setAddPropertyVisible(true)}
          />
        )}
      />

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
      ) : properties.length === 0 ? (
        <EmptyText>
          No properties yet. Add your first property to start tracking its maintenance.
        </EmptyText>
      ) : (
        <PropertyScrollRow
          properties={properties}
          wrap
          onPress={(id) => router.push(`/(tabs)/property/${id}` as any)}
          onRename={(property) => setRenamingProperty(property)}
          onDelete={(property) => setPendingDeleteIds([property.id])}
          selectedIds={sel.selectedIds}
          selectionMode={sel.selectionMode}
          onToggleSelect={sel.toggle}
          onEnterSelectionMode={sel.enter}
        />
      )}

      <AddPropertyPopup
        visible={addPropertyVisible}
        onClose={() => setAddPropertyVisible(false)}
        onPropertyAdded={() => { if (userId) loadProperties(userId); }}
      />

      <RenameModal
        visible={!!renamingProperty}
        title="Rename Property"
        initialValue={renamingProperty?.name ?? ''}
        onSave={handleRenameConfirm}
        onClose={() => setRenamingProperty(null)}
      />

      <ConfirmDeleteModal
        visible={pendingDeleteIds.length > 0}
        title={pendingDeleteIds.length === 1 ? 'Delete Property' : `Delete ${pendingDeleteIds.length} Properties`}
        message={
          pendingDeleteIds.length === 1
            ? `Are you sure you want to delete "${pendingDeleteName}"? This cannot be undone.`
            : `Are you sure you want to delete ${pendingDeleteIds.length} properties? This cannot be undone.`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteIds([])}
        loading={deleteLoading}
        loadingLabel={pendingDeleteIds.length === 1 ? 'Deleting property...' : `Deleting ${pendingDeleteIds.length} properties...`}
        cascadeLabel="Also delete all linked tasks and files"
      />

      <InfoPopup
        visible={!!successMessage}
        type="success"
        message={successMessage ?? ''}
        onClose={() => setSuccessMessage(null)}
        autoDismiss={2500}
        showConfirm={false}
      />
    </PageContainer>
  );
}
