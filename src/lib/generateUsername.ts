export function generateAnonymousUsername() {
  const adjectives = ["Mysterious", "Shadowy", "Silent", "Stealthy", "Ghostly"];
  const nouns = ["Gossiper", "Whisperer", "Informer", "Snooper", "Lurker"];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}
