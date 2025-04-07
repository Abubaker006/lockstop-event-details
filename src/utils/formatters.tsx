export const formatDate = (date: Date | string | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const formatTime = (date: Date | string | null): string | null => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split("T")[1].split(".")[0];
};