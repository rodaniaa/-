import os
import re
import json

bank_dir = r'c:\Users\user\Downloads\New folder (5)\backend\بنك'
frontend_dir = r'c:\Users\user\Downloads\New folder (5)\frontend'

# Letters array
letters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']

letter_mapping = {
    'ا': 'أ', 'ب': 'ب', 'ت': 'ت', 'ث': 'ث', 'ج': 'ج', 'ح': 'ح', 'خ': 'خ', 'د': 'د', 'ذ': 'ذ', 'ر': 'ر', 'ز': 'ز', 'س': 'س', 'ش': 'ش', 'ص': 'ص', 'ض': 'ض', 'ط': 'ط', 'ظ': 'ظ', 'ع': 'ع', 'غ': 'غ', 'ف': 'ف', 'ق': 'ق', 'ك': 'ك', 'ل': 'ل', 'م': 'م', 'ن': 'ن', 'ه': 'هـ', 'و': 'و', 'ي': 'ي'
}

categories_map = {
    'دين مسيحي': 'bible',
    'أسئلة عامة': 'general',
    'تاريخ': 'history',
    'جغرافيا': 'geography',
    'علوم': 'science',
    'رياضة': 'sports',
    'تكنولوجيا': 'tech',
    'هندسة': 'engineering',
    'طب': 'medicine',
    'ألغاز وفوازير': 'puzzles',
    'لغة عربية': 'arabic'
}

datasets = {cat: {} for cat in categories_map.values()}

if os.path.exists(bank_dir):
    files = os.listdir(bank_dir)
    for file in files:
        if not file.endswith('.md') and not file.endswith(',md'):
            continue
            
        filename_letter = file.split('.')[0].split(',')[0].strip()
        canonical_letter = letter_mapping.get(filename_letter, filename_letter)
        
        with open(os.path.join(bank_dir, file), 'r', encoding='utf-8') as f:
            content = f.read()
            
        current_cat = None
        current_level = None
        
        lines = content.split('\n')
        for i in range(len(lines)):
            line = lines[i].strip()
            
            cat_match = re.search(r'## \d+\.\s*مجال:\s*(.+)', line)
            if cat_match:
                cat_ar = cat_match.group(1).strip()
                current_cat = None
                for k, v in categories_map.items():
                    if k in cat_ar:
                        current_cat = v
                        break
                continue
                
            level_match = re.search(r'### مستوى:\s*(.+)', line)
            if level_match:
                current_level = level_match.group(1).strip()
                if 'وسط' in current_level:
                    current_level = 'متوسط'
                continue
                
            q_match = re.search(r'\*\s*\*\*سؤال:\*\*\s*(.+)', line)
            if q_match and current_cat and current_level:
                question = q_match.group(1).strip()
                # Clean up bold markers inside the question if any
                question = question.replace('**', '')
                
                ans_match = None
                for j in range(i+1, min(i+4, len(lines))):
                    a_match = re.search(r'\*\s*\*\*الجواب:\*\*\s*(.+)', lines[j])
                    if a_match:
                        ans_match = a_match.group(1).strip()
                        ans_match = ans_match.replace('**', '')
                        break
                        
                if ans_match:
                    if canonical_letter not in datasets[current_cat]:
                        datasets[current_cat][canonical_letter] = []
                    datasets[current_cat][canonical_letter].append((question, ans_match, current_level))

# Ensure exactly 15 questions per category/letter combo
for cat, data in datasets.items():
    for letter in letters:
        if letter not in data:
            data[letter] = []
        if len(data[letter]) < 15:
            # Generate generic fallback questions for each missing slot
            for i in range(15 - len(data[letter])):
                data[letter].append((f"سؤال في ({cat}) يبدأ بحرف ({letter}) - رقم {i+1}؟", "إجابة هذا السؤال متروكة لمقدم البرنامج", "متنوع"))

js_output_path = os.path.join(frontend_dir, 'questions.js')
try:
    with open(js_output_path, 'w', encoding='utf-8') as f:
        f.write('const q = (category, difficulty, id, question, answer) => ({ category, difficulty, id, question, answer });\n\n')
        f.write('const questionsBank = [\n')
        for cat, data in datasets.items():
            for letter, qlist in data.items():
                for (q_text, q_ans, q_diff) in qlist:
                    # Escape quotes in strings
                    q_text = q_text.replace('"', '\\"')
                    q_ans = q_ans.replace('"', '\\"')
                    f.write(f'  q("{cat}", "{q_diff}", "{letter}", "{q_text}", "{q_ans}"),\n')
        f.write('];\n\n')
        f.write('''// Global array to track used questions
let usedQuestions = JSON.parse(localStorage.getItem('el5aleyah_used_questions')) || [];

function getQuestion(letter, categories, difficulty, currentQText = "") {
  let options = questionsBank.filter(q => q.id === letter && categories.includes(q.category));
  
  if (options.length === 0) {
      return { category: categories[0] || "متنوع", difficulty: "متنوع", question: "لا توجد أسئلة متاحة في المجالات المحددة لهذا الحرف!", answer: "-" };
  }

  let idealMatch = options.filter(q => difficulty === "متنوع" || q.difficulty === difficulty);
  if (idealMatch.length > 0) {
      options = idealMatch;
  }

  let strictOptions = options.filter(q => q.question !== currentQText && !usedQuestions.includes(q.question));
  
  if (strictOptions.length === 0 && options.length > 1) {
      let optionQuestions = options.map(q => q.question);
      usedQuestions = usedQuestions.filter(q => !optionQuestions.includes(q));
      localStorage.setItem('el5aleyah_used_questions', JSON.stringify(usedQuestions));
      strictOptions = options.filter(q => q.question !== currentQText);
  }

  if (strictOptions.length > 0) {
     let selected = strictOptions[Math.floor(Math.random() * strictOptions.length)];
     usedQuestions.push(selected.question);
     localStorage.setItem('el5aleyah_used_questions', JSON.stringify(usedQuestions));
     return selected;
  }

  if (options.length > 0) {
     return options[Math.floor(Math.random() * options.length)];
  }

  return { category: categories[0] || "متنوع", difficulty: "متنوع", question: "حدث خطأ غير متوقع!", answer: "-" };
}
''')

    print("✅ تم توليد ملف questions.js بنجاح من مجلد بنك الأسئلة!")
except Exception as e:
    print(f"❌ حدث خطأ أثناء محاولة حفظ الملف: {e}")

input("\nاضغط Enter لإغلاق هذه النافذة...")

