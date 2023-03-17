type AppLog = {
    type: "log" | "warn" | "error" | "trace",
    message?: unknown;
    optionalParams: unknown[];
}