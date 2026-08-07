import { isJobActive, useExtraction, type ExtractionJob } from '@/contexts/ExtractionContext';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, shadows, spacing } from '@/theme/tokens';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import TaskConfirmationPopup from './TaskConfirmationPopup';

/**
 * App-level surface for background extraction: a compact status bar for jobs in flight,
 * and the single confirmation popup they hand off to.
 *
 * Mounted once at the root so a document keeps processing while the user moves around the
 * app, and so finishing does not interrupt whatever they are doing — a finished job waits
 * as a tappable row rather than seizing the screen.
 */
export default function ExtractionOverlay() {
  const { jobs, reviewingJob, reviewJob, closeReview, dismissJob, markTasksSaved } = useExtraction();

  return (
    <>
      {jobs.length > 0 ? (
        <View style={styles.dock} pointerEvents="box-none">
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onReview={() => reviewJob(job.id)}
              onDismiss={() => dismissJob(job.id)}
            />
          ))}
        </View>
      ) : null}

      <TaskConfirmationPopup
        visible={!!reviewingJob}
        tasks={reviewingJob?.tasks ?? []}
        userId={reviewingJob?.userId ?? ''}
        propertyId={reviewingJob?.propertyId}
        fileId={reviewingJob?.fileId}
        onClose={(saved) => {
          if (saved && reviewingJob) {
            markTasksSaved();
            dismissJob(reviewingJob.id);
          } else {
            closeReview();
          }
        }}
      />
    </>
  );
}

function JobRow({
  job,
  onReview,
  onDismiss,
}: {
  job: ExtractionJob;
  onReview: () => void;
  onDismiss: () => void;
}) {
  const { colors } = useTheme();

  const done = job.status === 'ready';
  const failed = job.status === 'error';
  const active = isJobActive(job);
  const actionable = done && job.tasks.length > 0;

  const accent = failed ? colors.danger : done ? colors.success : colors.info;

  return (
    // A plain View, not a Pressable: the review target and the dismiss control have to be
    // siblings. Nesting them makes react-native-web emit a <button> inside a <button>,
    // which is invalid and only shows up once a finished row gains both at the same time.
    <View
      style={[
        styles.row,
        shadows.md,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />

      <Pressable
        onPress={actionable ? onReview : undefined}
        disabled={!actionable}
        accessibilityRole={actionable ? 'button' : undefined}
        accessibilityLabel={actionable ? `Review ${job.tasks.length} extracted tasks` : job.message}
        style={({ pressed }) => [styles.main, { opacity: pressed && actionable ? 0.85 : 1 }]}
      >
        <View style={styles.icon}>
          {failed ? (
            <MaterialIcons name="error-outline" size={20} color={colors.danger} />
          ) : done ? (
            <MaterialIcons name="check-circle-outline" size={20} color={colors.success} />
          ) : (
            <ActivityIndicator size="small" color={colors.info} />
          )}
        </View>

        <View style={styles.body}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
            {job.fileName}
          </Text>
          <Text style={[styles.status, { color: colors.textMuted }]}>
            {failed ? job.error ?? job.message : job.message}
          </Text>

          {job.totalPages && !done && !failed ? (
            <View style={[styles.track, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: accent,
                    width: `${Math.round((job.page / job.totalPages) * 100)}%`,
                  },
                ]}
              />
            </View>
          ) : null}

          {active || actionable ? (
            <View style={styles.warnRow}>
              <MaterialIcons name="info-outline" size={12} color={colors.warning} />
              <Text style={[styles.warn, { color: colors.warning }]}>
                {active
                  ? 'Keep the app open — closing it will stop processing.'
                  : 'Not saved yet — closing the app will discard these.'}
              </Text>
            </View>
          ) : null}
        </View>

        {actionable ? (
          <View style={[styles.cta, { backgroundColor: colors.success }]}>
            <Text style={styles.ctaText}>Review</Text>
          </View>
        ) : null}
      </Pressable>

      {done || failed ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Dismiss ${job.fileName}`}
          style={styles.close}
        >
          <MaterialIcons name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 520,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingRight: spacing.sm,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
  },
  /** The review target. Sibling of the dismiss control, never its parent. */
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  status: {
    fontSize: fontSize.xs,
  },
  track: {
    height: 3,
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    borderRadius: 2,
  },
  cta: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
  },
  ctaText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  close: {
    padding: spacing.xs,
  },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  warn: {
    fontSize: fontSize.xs,
    flex: 1,
  },
});
