import { useState } from 'react';
import Button from '@/components/Button';
import InfoPopup from '@/components/InfoPopup';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { DBTask, StandardFeature } from '@/types';
import {
  addFeatureToProperty,
  removeFeatureFromProperty,
} from '@/services/featureService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  userId: string;
  features: StandardFeature[];
  enabledFeatureIds: Set<number>;
  onFeatureAdded: (featureId: number, newTasks: DBTask[]) => void;
  onFeatureRemoved: (featureId: number) => void;
};

export default function ManageFeaturesModal({
  visible,
  onClose,
  propertyId,
  userId,
  features,
  enabledFeatureIds,
  onFeatureAdded,
  onFeatureRemoved,
}: Props) {
  const { colors } = useTheme();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (feature: StandardFeature) => {
    if (loadingId !== null) return;
    setLoadingId(feature.id);
    try {
      if (enabledFeatureIds.has(feature.id)) {
        await removeFeatureFromProperty(propertyId, feature.id);
        onFeatureRemoved(feature.id);
      } else {
        const newTasks = await addFeatureToProperty(propertyId, feature.id, userId);
        onFeatureAdded(feature.id, newTasks);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <InfoPopup
        visible={!!error}
        type="error"
        title="Error"
        message={error ?? ''}
        onClose={() => setError(null)}
      />
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.box, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Property Features</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Toggle features to auto-add their standard tasks.
            </Text>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {features.length === 0 && (
                <Text style={[styles.empty, { color: colors.textMuted }]}>
                  No standard features configured yet.
                </Text>
              )}
              {features.map((feature) => {
                const isEnabled = enabledFeatureIds.has(feature.id);
                const isLoading = loadingId === feature.id;
                return (
                  <TouchableOpacity
                    key={feature.id}
                    onPress={() => handleToggle(feature)}
                    disabled={loadingId !== null}
                    activeOpacity={0.7}
                    style={[
                      styles.row,
                      {
                        borderColor: isEnabled ? colors.success : colors.border,
                        backgroundColor: isEnabled ? colors.successLight : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={[styles.featureName, { color: colors.textPrimary }]}>
                        {feature.name}
                      </Text>
                      {feature.keywords && feature.keywords.length > 0 && (
                        <Text style={[styles.keywords, { color: colors.textMuted }]} numberOfLines={1}>
                          {feature.keywords.join(', ')}
                        </Text>
                      )}
                    </View>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.success} />
                    ) : (
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isEnabled ? colors.success : 'transparent',
                            borderColor: isEnabled ? colors.success : colors.inputBorder,
                          },
                        ]}
                      >
                        {isEnabled && (
                          <MaterialIcons name="check" size={14} color="#fff" />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button
              title="Done"
              onPress={onClose}
              variant="secondary"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 360,
    maxWidth: '92%',
    maxHeight: '80%',
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 380,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: fontSize.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
  featureName: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  keywords: {
    fontSize: fontSize.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
