export const formatDate = (date: any): string => {
  try {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}.${month}.${year}`; // Örn: 25.03.2025
  } catch (err) {
    return "";
  }
};
