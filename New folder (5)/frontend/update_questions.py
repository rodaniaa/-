import os
import re
import datetime

# Setup Paths
current_dir = os.path.dirname(os.path.abspath(__file__))
bank_dir = os.path.join(current_dir, 'بنك')
if not os.path.exists(bank_dir):
    bank_dir = os.path.join(os.path.dirname(current_dir), 'backend', 'بنك')

js_file = os.path.join(current_dir, 'all_questions.js')

print("--- Game Question Updater (v3.1) ---")
if not os.path.exists(bank_dir):
    print(f"Error: Could not find 'بنك' folder in {bank_dir}")
    exit(1)

print(f"Bank found at: {bank_dir}")
print(f"Target file: {js_file}")

letters_board = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']
letter_mapping = {'ا': 'أ', 'أ': 'أ', 'إ': 'أ', 'آ': 'أ', 'ة': 'هـ', 'ه': 'هـ', 'هـ': 'هـ', 'ى': 'ي', 'ي': 'ي'}
categories_map = {
    'دين': 'bible', 'مسيح': 'bible', 'عام': 'general', 'تاريخ': 'history', 
    'جغرافيا': 'geography', 'علوم': 'science', 'رياضة': 'sports', 
    'تكنولوجيا': 'tech', 'هندسة': 'engineering', 'طب': 'medicine', 
    'الغاز': 'puzzles', 'ألغاز': 'puzzles', 'عرب': 'arabic'
}

def clean_ar(t): 
    return re.sub(r'[أإآا]', 'ا', t).replace('ة', 'ه').replace(' ', '').strip().lower()

def run():
    unique_questions = set()
    questions_list = []
    stats = {l: 0 for l in letters_board}
    
    files = [f for f in os.listdir(bank_dir) if f.endswith('.md') or '.md' in f]
    for f_name in files:
        raw_l = re.split(r'[,.]', f_name)[0].strip()
        l_canonical = letter_mapping.get(raw_l, raw_l)
        if l_canonical not in letters_board: continue

        lines = []
        for enc in ['utf-8-sig', 'utf-8', 'windows-1256', 'utf-16']:
            try:
                with open(os.path.join(bank_dir, f_name), 'r', encoding=enc) as f:
                    lines = f.readlines()
                if lines: break
            except: continue
        
        if not lines: continue
        
        c_cat = "general"
        c_diff = "سهل"
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line: continue
            
            if line.startswith('##') and not line.startswith('###'):
                c_line = clean_ar(line)
                for ar, en in categories_map.items():
                    if clean_ar(ar) in c_line:
                        c_cat = en
                        break
                continue
            
            if line.startswith('###'):
                if 'سهل' in line: c_diff = 'سهل'
                elif 'وسط' in line or 'متوسط' in line: c_diff = 'متوسط'
                elif 'صعب' in line: c_diff = 'صعب'
                continue
            
            if 'سؤال' in line:
                parts = re.split(r'سؤال[\s\*]*[:：]?', line, 1)
                if len(parts) < 2: continue
                q_text = parts[1].strip(' *').replace('**', '').strip()
                if not q_text or len(q_text) < 3: continue
                
                a_text = ""
                for j in range(i+1, min(i+6, len(lines))):
                    if 'الجواب' in lines[j] or 'جواب' in lines[j]:
                        a_parts = re.split(r'الجواب[\s\*]*[:：]?', lines[j], 1)
                        if len(a_parts) >= 2:
                            a_text = a_parts[1].strip(' *').replace('**', '').strip()
                            break
                
                if a_text:
                    q_id = f"{l_canonical}_{q_text}"
                    if q_id not in unique_questions:
                        unique_questions.add(q_id)
                        questions_list.append({
                            'cat': c_cat, 'diff': c_diff, 'letter': l_canonical, 'q': q_text, 'a': a_text
                        })
                        stats[l_canonical] += 1

    try:
        total = len(questions_list)
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(f"// Generated on: {datetime.datetime.now()}\n")
            f.write('const q = (category, difficulty, id, question, answer) => ({ category, difficulty, id, question, answer });\n\n')
            f.write('const questionsBank = [\n')
            for item in questions_list:
                qt = item['q'].replace('"', '\\"').replace('\n', ' ').strip()
                at = item['a'].replace('"', '\\"').replace('\n', ' ').strip()
                f.write(f'  q("{item["cat"]}", "{item["diff"]}", "{item["letter"]}", "{qt}", "{at}"),\n')
            f.write('];\n\n')
            f.write('let usedQuestions = JSON.parse(localStorage.getItem("el5aleyah_used_questions")) || [];\n\n')
            f.write('''function getQuestion(letter, categories, difficulty, currentQText = "") {
  const letterMapping = {'ا': 'أ', 'أ': 'أ', 'إ': 'أ', 'آ': 'أ', 'ة': 'هـ', 'ه': 'هـ', 'هـ': 'هـ', 'ى': 'ي', 'ي': 'ي'};
  const targetLetter = letterMapping[letter] || letter;
  let options = questionsBank.filter(q => {
    const qLetter = letterMapping[q.id] || q.id;
    return qLetter === targetLetter && categories.includes(q.category);
  });
  if (options.length === 0) return { category: "bible", difficulty: "متنوع", question: "لا توجد أسئلة كافية لهذا الحرف!", answer: "-" };
  let dMatch = options.filter(q => difficulty === "متنوع" || q.difficulty === difficulty);
  if (dMatch.length > 0) options = dMatch;
  let fresh = options.filter(q => q.question !== currentQText && !usedQuestions.includes(q.question));
  if (fresh.length === 0) {
    const pool = options.map(o => o.question);
    usedQuestions = usedQuestions.filter(t => !pool.includes(t));
    fresh = options.filter(q => q.question !== currentQText);
  }
  const sel = (fresh.length > 0) ? fresh[Math.floor(Math.random() * fresh.length)] : options[0];
  if (sel.question && sel.question !== "لا توجد أسئلة كافية!") {
    if (!usedQuestions.includes(sel.question)) {
      usedQuestions.push(sel.question);
      if (usedQuestions.length > 2000) usedQuestions.shift();
      localStorage.setItem("el5aleyah_used_questions", JSON.stringify(usedQuestions));
    }
  }
  return sel;
}
''')
        print(f"Success! Total questions imported: {total}")
    except Exception as e:
        print(f"Error saving: {e}")

if __name__ == "__main__":
    run()
