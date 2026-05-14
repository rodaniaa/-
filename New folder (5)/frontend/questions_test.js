const q = (category, difficulty, id, question, answer) => ({ category, difficulty, id, question, answer });

const questionsBank = [
  q("bible", "سهل", "أ", "من هو أول إنسان خلقه الله؟", "آدم"),
  q("bible", "سهل", "ب", "من هو تلميذ المسيح الملقب بصخرة؟", "بطرس"),
];

function getQuestion(letter, categories, difficulty, currentQText = "") {
  return questionsBank[0];
}
