import Dropdown from '@/components/Dropdown';
import { ANCHOR_OPTIONS, FREQ_OPTIONS } from '@/constants/recurrence';
import { SEVERITY_OPTIONS, isSeverity, severityColor } from '@/constants/severity';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { FileRecord, Property, RecurAnchor, RecurFrequency, Severity, TaskType } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from './Button';
import TaskImageStrip from './TaskImageStrip';
import { DateInput } from './DateInput';
import IconButton from './IconButton';

type TaskItemProps = {
  task: TaskType;
  onUpdate: (updatedTask: TaskType) => void;
  onDelete: () => void;
  onTap?: () => void;
  readOnly?: boolean;
  propertyName?: string;
  selected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
  /** Dashboard: pass all properties so user can change property in edit mode */
  properties?: Property[];
  /** Property detail: pass pre-loaded files for the current property */
  files?: FileRecord[];
};

function getUrgencyColor(dueDate: Date | null, colors: ReturnType<typeof useTheme>['colors']): string {
  if (!dueDate) return colors.urgencyNone;
  const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return colors.urgencyPast;
  if (days <= 30) return colors.urgencyMonth;
  return colors.urgencyFuture;
}

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  onTap,
  readOnly,
  propertyName,
  selected,
  selectionMode,
  onLongPress,
  properties,
  files: propFiles,
}: TaskItemProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(task.propertyId ?? null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(task.fileId ?? null);
  const [recurFrequency, setRecurFrequency] = useState<RecurFrequency | null>(task.recurFrequency ?? null);
  const [recurAnchor, setRecurAnchor] = useState<RecurAnchor>(task.recurAnchor ?? 'completion');
  const [severity, setSeverity] = useState<Severity | null>(task.severity ?? null);
  const [moreInfo, setMoreInfo] = useState(task.moreInfo ?? '');
  const [showPhotos, setShowPhotos] = useState(false);

  const photoCount = task.imageRefs?.length ?? 0;

  const availableFiles = usePropertyFiles(
    properties ? selectedPropertyId : null,
    propFiles,
    selectedFileId,
    () => setSelectedFileId(null),
  );

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setSelectedPropertyId(task.propertyId ?? null);
    setSelectedFileId(task.fileId ?? null);
    setRecurFrequency(task.recurFrequency ?? null);
    setRecurAnchor(task.recurAnchor ?? 'completion');
    setSeverity(task.severity ?? null);
    setMoreInfo(task.moreInfo ?? '');
  }, [task]);

  useEffect(() => {
    if (selectionMode) setEditing(false);
  }, [selectionMode]);

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description,
      dueDate,
      propertyId: selectedPropertyId,
      fileId: selectedFileId,
      recurFrequency,
      recurAnchor: recurFrequency ? recurAnchor : null,
      severity,
      moreInfo: moreInfo.trim() ? moreInfo.trim() : null,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setSelectedPropertyId(task.propertyId ?? null);
    setSelectedFileId(task.fileId ?? null);
    setRecurFrequency(task.recurFrequency ?? null);
    setRecurAnchor(task.recurAnchor ?? 'completion');
    setSeverity(task.severity ?? null);
    setMoreInfo(task.moreInfo ?? '');
    setEditing(false);
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.info : colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      {editing ? (
        <View style={styles.editContainer}>
          <Text style={[styles.editHeader, { color: colors.textPrimary }]}>Edit Task</Text>

          {properties && (
            <Dropdown
              label="Property"
              options={properties.map((p) => ({ label: p.name, value: p.id }))}
              selected={selectedPropertyId}
              onSelect={setSelectedPropertyId}
              placeholder="None"
              size="sm"
            />
          )}

          {(availableFiles.length > 0 || selectedFileId) && (
            <Dropdown
              label="Link to file"
              options={availableFiles.map((f) => ({ label: f.file_name, value: f.id }))}
              selected={selectedFileId}
              onSelect={setSelectedFileId}
              placeholder="None"
              size="sm"
            />
          )}

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, {
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
                backgroundColor: colors.inputBackground,
              }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, {
                borderColor: colors.inputBorder,
                color: colors.textSecondary,
                backgroundColor: colors.inputBackground,
              }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Additional info</Text>
            <TextInput
              value={moreInfo}
              onChangeText={setMoreInfo}
              placeholder="What was observed, and where"
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              style={[styles.input, styles.multiline, {
                borderColor: colors.inputBorder,
                color: colors.textSecondary,
                backgroundColor: colors.inputBackground,
              }]}
            />
          </View>

          <Dropdown
            label="Severity"
            options={SEVERITY_OPTIONS}
            selected={severity}
            onSelect={(v) => setSeverity(isSeverity(v) ? v : null)}
            placeholder="None"
            size="sm"
          />

          <DateInput value={dueDate} onChange={setDueDate} />

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.recurrenceRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted, marginBottom: 0 }]}>Repeats</Text>
            {recurFrequency && (
              <TouchableOpacity onPress={() => setRecurFrequency(null)} hitSlop={8}>
                <MaterialIcons name="close" size={13} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <Dropdown
            options={FREQ_OPTIONS}
            selected={recurFrequency}
            onSelect={(v) => setRecurFrequency(v as RecurFrequency | null)}
            placeholder="No recurrence"
            size="sm"
          />
          {recurFrequency && (
            <Dropdown
              label="Schedule from"
              options={ANCHOR_OPTIONS}
              selected={recurAnchor}
              onSelect={(v) => setRecurAnchor((v as RecurAnchor) ?? 'completion')}
              size="sm"
            />
          )}

          <View style={styles.btnRow}>
            <Button title="Save" size="sm" onPress={handleSave} variant="success" style={{ flex: 1 }} />
            <Button title="Cancel" size="sm" onPress={handleCancel} variant="secondary" style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={selectionMode ? onLongPress : onTap}
          onLongPress={!selectionMode ? onLongPress : undefined}
          delayLongPress={400}
          activeOpacity={selectionMode ? 0.7 : 0.85}
          style={styles.viewRow}
        >
          {selectionMode ? (
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: selected ? colors.info : colors.surface,
                  borderColor: selected ? colors.info : colors.inputBorder,
                },
              ]}
            >
              {selected && <MaterialIcons name="check" size={12} color={colors.textInverse} />}
            </View>
          ) : (
            <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(dueDate, colors) }]} />
          )}

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={[styles.taskTitle, { color: colors.textPrimary }]}>{task.title}</Text>
              {/* Severity stays inline rather than behind the toggle: it is state, and it
                  has to be readable at a glance down a long list. */}
              {task.severity ? (
                <View style={[styles.sevChip, { backgroundColor: severityColor(task.severity, colors) }]}>
                  <Text style={styles.sevChipText}>
                    {(task.severityLabel || task.severity).toUpperCase()}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Neither of these is clamped: they carry the extracted finding — what was
                observed and where — which is what makes a task actionable. */}
            {task.description ? (
              <Text style={[styles.taskDesc, { color: colors.textMuted }]}>
                {task.description}
              </Text>
            ) : null}
            {task.moreInfo && task.moreInfo !== task.description ? (
              <Text style={[styles.taskDesc, { color: colors.textMuted }]}>
                {task.moreInfo}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              {!!dueDate && (
                <Text style={[styles.metaText, { color: colors.textDisabled }]}>
                  Due {dueDate.toISOString().split('T')[0]}
                </Text>
              )}
              {!!dueDate && !!propertyName && (
                <Text style={[styles.metaText, { color: colors.border }]}>·</Text>
              )}
              {!!propertyName && (
                <Text style={[styles.metaText, { color: colors.textDisabled }]}>{propertyName}</Text>
              )}
              {!!task.recurFrequency && (
                <>
                  {!!(dueDate || propertyName) && (
                    <Text style={[styles.metaText, { color: colors.border }]}>·</Text>
                  )}
                  <MaterialIcons name="refresh" size={10} color={colors.info} />
                </>
              )}
            </View>
          </View>

          {!readOnly && !selectionMode && (
            <>
              <IconButton
                icon="edit"
                iconSize={15}
                size={27}
                onPress={() => setEditing(true)}
                iconColor={colors.textDisabled}
                style={{ backgroundColor: 'transparent' }}
              />
              <IconButton
                icon="delete-outline"
                iconSize={15}
                size={27}
                onPress={onDelete}
                iconColor={colors.border}
                style={{ backgroundColor: 'transparent' }}
              />
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Sibling of the touch target above, never a child: the toggle and the thumbnails
          are tappable in their own right, and nesting them would swallow the card's tap
          and produce a button inside a button on web.

          Collapsed by default — a task list is scanned, and a row of photographs on every
          card costs more vertical space than it earns until you want to look. */}
      {!editing && !selectionMode && photoCount > 0 ? (
        <View style={styles.photos}>
          <TouchableOpacity
            onPress={() => setShowPhotos((v) => !v)}
            style={styles.photoToggle}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityState={{ expanded: showPhotos }}
            accessibilityLabel={`${showPhotos ? 'Hide' : 'Show'} ${photoCount} photo${
              photoCount === 1 ? '' : 's'
            }`}
          >
            <MaterialIcons name="photo-library" size={13} color={colors.textMuted} />
            <Text style={[styles.photoToggleText, { color: colors.textMuted }]}>
              {photoCount} photo{photoCount === 1 ? '' : 's'}
            </Text>
            <MaterialIcons
              name={showPhotos ? 'expand-less' : 'expand-more'}
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showPhotos ? <TaskImageStrip imageRefs={task.imageRefs} size={64} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    marginBottom: spacing.xs + 2,
    overflow: 'hidden',
  },
  photos: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  photoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  photoToggleText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  sevChip: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  sevChipText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  multiline: {
    minHeight: 64,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  editContainer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  editHeader: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    fontWeight: '600',
    fontSize: fontSize.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 7,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  recurrenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: spacing.sm + 2,
    flexShrink: 0,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: spacing.sm + 2,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  taskTitle: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  taskDesc: {
    fontSize: 12,
    marginTop: 1,
    // Now that it wraps, it needs room to breathe across lines.
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.xs,
  },
});
