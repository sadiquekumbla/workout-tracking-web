export const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "The hard days are what make you stronger.",
  "Success starts with self-discipline.",
  "Your health is an investment, not an expense.",
  "The only person you are destined to become is the person you decide to be.",
  "Don't wish for it. Work for it.",
  "Your future self is watching you right now through memories.",
  "The difference between try and triumph is just a little umph!",
  "Pain is temporary. Quitting lasts forever.",
  "The only limit is the one you set yourself.",
  "Your body hears everything your mind says.",
  "Fall in love with the process of becoming the very best version of yourself.",
  "The hard days are the best because that's when champions are made.",
  "You are stronger than you think.",
];

export function getRandomQuote(): string {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
} 