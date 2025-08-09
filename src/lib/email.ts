import { Resend } from 'resend';
import type { Workout, WorkoutExercise } from '@/lib/db/schema';

type WorkoutWithExercises = Workout & { exercises?: WorkoutExercise[] };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || 'notifications@fitflick.com';
const PARENT_EMAIL = process.env.WORKOUT_NOTIFY_EMAIL || 'guysopher@gmail.com';

function formatSeconds(totalSeconds: number | null | undefined): string {
  const seconds = Math.max(0, Number(totalSeconds || 0));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export async function sendWorkoutCompletedEmail(params: {
  childName: string;
  parentEmail?: string;
  workout: WorkoutWithExercises | null | undefined;
}): Promise<void> {
  const parentEmail = params.parentEmail || PARENT_EMAIL;
  if (!parentEmail) return; // No recipient configured; silently skip
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set; skipping workout notification email');
    return;
  }

  const resend = new Resend(RESEND_API_KEY);

  const workoutName = params.workout?.name || 'Workout';
  const completedAt = params.workout?.completedAt || new Date();
  const totalDuration = params.workout?.totalDuration ?? undefined;
  const calories = params.workout?.caloriesBurned ?? undefined;

  const exercises = (params.workout?.exercises || []).map((ex) => ({
    name: ex.exerciseName,
    actualDuration: ex.actualDuration,
  }));

  const subject = `${params.childName} completed ${workoutName}`;

  const exerciseListHtml = exercises.length
    ? `<ul>${exercises
        .map(
          (e) =>
            `<li><strong>${e.name}</strong>${
              e.actualDuration ? ` — ${formatSeconds(e.actualDuration)}` : ''
            }</li>`
        )
        .join('')}</ul>`
    : '<p>No individual exercise details were recorded.</p>';

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">Great news! 🎉</h2>
      <p><strong>${params.childName}</strong> just completed <strong>${workoutName}</strong>.</p>
      <p>
        <strong>When</strong>: ${new Date(completedAt).toLocaleString()}<br/>
        ${typeof totalDuration === 'number' ? `<strong>Total time</strong>: ${formatSeconds(totalDuration)}<br/>` : ''}
        ${typeof calories === 'number' ? `<strong>Estimated calories</strong>: ${calories}` : ''}
      </p>
      <h3 style="margin: 20px 0 8px;">Exercises</h3>
      ${exerciseListHtml}
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">You’re receiving this because workout email notifications are enabled.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: parentEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send workout notification email:', error);
  }
}

