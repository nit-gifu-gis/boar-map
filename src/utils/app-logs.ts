type LogMethod = 'log' | 'warn' | 'error' | 'trace';

export interface CapturedLog {
  type: LogMethod;
  message: unknown;
  optionalParams: unknown[];
}

// The cleanup is also used by Strict Mode's setup/cleanup/setup cycle.
export const captureConsole = (onLog: (entry: CapturedLog) => void) => {
  const methods: LogMethod[] = ['log', 'warn', 'error', 'trace'];
  const cleanups: (() => void)[] = [];
  let active = true;

  for (const method of methods) {
    const original = console[method];
    const handler = (message?: unknown, ...optionalParams: unknown[]) => {
      original.call(console, message, ...optionalParams);
      // React can log while rendering. Publish afterwards to avoid updating another component.
      queueMicrotask(() => {
        if (active) onLog({ type: method, message, optionalParams });
      });
    };
    console[method] = handler;
    cleanups.push(() => {
      if (console[method] === handler) console[method] = original;
    });
  }

  return () => {
    active = false;
    cleanups.forEach((cleanup) => cleanup());
  };
};
