const TURKISH_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR");
};

export const formatMessageTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatDayForChat = (date: Date | string): string => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return "Bugün";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Dün";
  } else {
    const day = messageDate.getDate();
    const month = TURKISH_MONTHS[messageDate.getMonth()];
    const year = messageDate.getFullYear();
    const currentYear = new Date().getFullYear();

    // Eğer yıl aynıysa yılı göstermeye gerek yok
    if (year === currentYear) {
      return `${day} ${month}`;
    }
    return `${day} ${month} ${year}`;
  }
};
