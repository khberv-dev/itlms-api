

function generateStrongPassword(length: number = 12): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

  const allChars = upper + lower + numbers + symbols;

  // Har bir turdan kamida 1 ta bo‘lishini kafolatlash
  let password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  // Qolgan belgilarni random to‘ldirish
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Belgilarni aralashtirib yuborish (shuffle)
  return password
    .sort(() => Math.random() - 0.5)
    .join("");
}

export default generateStrongPassword;