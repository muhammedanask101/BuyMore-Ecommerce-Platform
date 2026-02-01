import LoginAttempt from '@/models/LoginAttempt';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;
const BLOCK_MINUTES = 15;

export async function checkRateLimit(key: string) {
  const now = new Date();

  const attempt = await LoginAttempt.findOne({ key });

  if (attempt?.blockedUntil && attempt.blockedUntil > now) {
    return { blocked: true };
  }

  if (!attempt) {
    await LoginAttempt.create({ key });
    return { blocked: false };
  }

  const diffMinutes = (now.getTime() - attempt.updatedAt.getTime()) / 60000;

  if (diffMinutes > WINDOW_MINUTES) {
    attempt.count = 1;
    attempt.blockedUntil = null;
    await attempt.save();
    return { blocked: false };
  }

  attempt.count += 1;

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = new Date(now.getTime() + BLOCK_MINUTES * 60000);
  }

  await attempt.save();

  return { blocked: attempt.blockedUntil !== null };
}
