type LogLevel = 'info' | 'error';

export function log(level: LogLevel, message: string, details: Record<string, unknown> = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...details,
  });

  if (level === 'error') {
    console.error(entry);
    return;
  }

  console.log(entry);
}