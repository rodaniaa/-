// FORCE UPDATE
const q = (category, difficulty, id, question, answer) => ({ category, difficulty, id, question, answer });

const questionsBank = [
  q("bible", "سهل", "أ", "من هو أول إنسان خلقه الله على الأرض؟", "آدم"),
  q("bible", "سهل", "أ", "ما هي المدينة المقدسة التي صلب فيها السيد المسيح؟", "أورشليم"),
  q("bible", "سهل", "أ", "ماذا يطلق على الكتاب المقدس الذي يضم تعاليم وحياة السيد المسيح؟", "إنجيل"),
  q("bible", "سهل", "ث", "كم عدد الأقانيم في العقيدة المسيحية؟", "ثلاثة"),
  q("bible", "سهل", "ث", "ماذا يطلق على مريم العذراء باللغة اليونانية ويعني (والدة الإله)؟", "ثيؤطوكوس"),
  q("bible", "سهل", "ض", "ما هو اللقب الذي يُطلق على الله ليعبر عن سيطرته على كل الكون؟", "ضابط الكل"),
  q("bible", "سهل", "ض", "ماذا يسمى الصوت الداخلي للإنسان الذي يميز بين الخير والشر؟", "ضمير"),
  q("bible", "سهل", "غ", "ما هو الفعل الذي يطلبه المؤمن من الله لكي يسامحه على خطاياه؟", "غفران"),
  q("bible", "سهل", "غ", "ماذا يُسمى العيد الذي يحتفل به المسيحيون بذكرى معمودية المسيح؟", "غطاس")
];

// Add more data automatically if possible
let usedQuestions = JSON.parse(localStorage.getItem("el5aleyah_used_questions")) || [];

function getQuestion(letter, categories, difficulty, currentQText = "") {
  let options = questionsBank.filter(q => q.id === letter && categories.includes(q.category));
  if (options.length === 0) return { category: "bible", difficulty: "متنوع", question: "لا توجد أسئلة لهذا الحرف حالياً!", answer: "-" };
  let dMatch = options.filter(q => difficulty === "متنوع" || q.difficulty === difficulty);
  if (dMatch.length > 0) options = dMatch;
  const sel = options[Math.floor(Math.random() * options.length)];
  return sel;
}
