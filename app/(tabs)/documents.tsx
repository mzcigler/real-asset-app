import Button from '@/components/Button';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import EmptyText from '@/components/EmptyText';
import FileItem from '@/components/FileItem';
import FilterChips from '@/components/FilterChips';
import InfoPopup from '@/components/InfoPopup';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import UploadExtractPopup from '@/components/upload/UploadExtractPopup';
import { supabase } from '@/services/supabase';
import { deleteFiles, downloadFile, fetchFilesForProperty } from '@/services/fileService';
import { fetchProperties } from '@/services/propertyService';
import { useTheme } from '@/theme/ThemeContext';
import { FileRecord, Property } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [propertyFilter, setPropertyFilter] = useState<string | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [pendingDeleteFile, setPendingDeleteFile] = useState<FileRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/(auth)/login'); return; }
      setUserId(data.user.id);
      loadDocuments(data.user.id);
    });
  }, []);

  const loadDocuments = async (uid: string) => {
    setLoading(true);
    const props = await fetchProperties(uid);
    setProperties(props);
    const perProperty = await Promise.all(props.map((p) => fetchFilesForProperty(p.id)));
    setFiles(perProperty.flat());
    setLoading(false);
  };

  const handleDownload = (file: FileRecord) => {
    downloadFile(file.file_path, file.file_name).catch((err) => console.error('Download failed:', err));
  };

  const handleDeleteConfirm = async (cascade?: boolean) => {
    if (!pendingDeleteFile) return;
    setDeleteLoading(true);
    await deleteFiles([pendingDeleteFile], cascade ?? true);
    setFiles((prev) => prev.filter((f) => f.id !== pendingDeleteFile.id));
    setPendingDeleteFile(null);
    setDeleteLoading(false);
    setSuccessMessage('Document deleted');
  };

  const displayedFiles = propertyFilter
    ? files.filter((f) => f.property_id === propertyFilter)
    : files;

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        subtitle="Store reports, receipts, warranties, and more."
        right={
          <Button
            title="Upload"
            variant="primary"
            size="sm"
            leftIcon={<MaterialIcons name="upload" size={16} color={colors.textInverse} />}
            onPress={() => setUploadVisible(true)}
          />
        }
      />

      {!loading && properties.length > 0 && (
        <FilterChips
          options={[
            { label: 'All', value: null },
            ...properties.map((p) => ({ label: p.name, value: p.id })),
          ]}
          selected={propertyFilter}
          onSelect={setPropertyFilter}
        />
      )}

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
      ) : displayedFiles.length === 0 ? (
        <EmptyText>
          No documents yet. Upload reports and files to keep everything organized.
        </EmptyText>
      ) : (
        displayedFiles.map((file) => (
          <FileItem
            key={file.id}
            fileName={file.file_name}
            onOpen={() => handleDownload(file)}
            onDelete={() => setPendingDeleteFile(file)}
          />
        ))
      )}

      <UploadExtractPopup
        visible={uploadVisible}
        userId={userId ?? ''}
        onClose={() => setUploadVisible(false)}
        onSuccess={() => { if (userId) loadDocuments(userId); }}
      />

      <ConfirmDeleteModal
        visible={!!pendingDeleteFile}
        title="Delete Document"
        message={`Are you sure you want to delete "${pendingDeleteFile?.file_name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteFile(null)}
        loading={deleteLoading}
        loadingLabel="Deleting document..."
        cascadeLabel="Also delete linked tasks"
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
