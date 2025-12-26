function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}
function formatDate(timestamp, locale) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString(locale);
}
function formatDateTime(timestamp, locale) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleString(locale);
}
function formatTime(timestamp, options = { hour: "2-digit", minute: "2-digit", hour12: true }, locale) {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleTimeString(locale, options);
}
function formatRelativeTime(timestamp, baseTimestamp = Date.now(), t) {
  const diffMs = baseTimestamp - timestamp;
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMs / 36e5);
  const diffDays = Math.floor(diffMs / 864e5);
  if (t) {
    if (diffMins < 1) return t("common.time.justNow");
    if (diffMins < 60) return t("common.time.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("common.time.hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("common.time.daysAgo", { count: diffDays });
  } else {
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
  return formatDate(timestamp);
}
export {
  formatTime as a,
  formatBytes as b,
  formatDateTime as c,
  formatRelativeTime as f
};
