
import re
import json
import os

def parse_numericals(file_path):
    numericals = []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to find the numericals array
    match = re.search(r'numericals:\s*\[(.*?)\]', content, re.DOTALL)
    if match:
        items_str = match.group(1)
        # Split by objects roughly (assuming starts with { and ends with })
        # unique pattern: { id: ... }
        item_matches = re.finditer(r'\{\s*id:\s*(\d+).*?\}', items_str, re.DOTALL)
        
        # We need to extract fields from each item
        # Since it's TS, not JSON, we can't just json.loads. We regex each field.
        
        # Let's split by "}," to iterate
        items = items_str.split('},')
        for item in items:
            item = item.strip()
            if not item.endswith('}'): item += '}'
            if 'id:' not in item: continue
            
            n_id = re.search(r'id:\s*(\d+)', item).group(1)
            title = re.search(r'title:\s*"(.*?)"', item).group(1)
            desc = re.search(r'description:\s*"(.*?)"', item).group(1)
            # difficulty might have 'as const'
            diff_match = re.search(r'difficulty:\s*"(.*?)"', item)
            diff = diff_match.group(1) if diff_match else 'Medium'
            
            xp_match = re.search(r'xp:\s*(\d+)', item)
            xp = xp_match.group(1) if xp_match else '0'
            
            numericals.append({
                'id': n_id,
                'title': title,
                'desc': desc,
                'diff': diff,
                'xp': xp
            })
    return numericals

def parse_quizzes(file_path):
    quizzes = []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # We'll use a state machine or simpler approach since the structure is regular
    # But regex for the whole object might be fragile.
    # Let's try to extract the array content first.
    
    start = content.find('export const aimlQuizzes = [')
    if start == -1: return []
    start += len('export const aimlQuizzes = [')
    
    # Naive bracket counting to find end of array
    count = 1
    end = start
    while count > 0 and end < len(content):
        if content[end] == '[': count += 1
        elif content[end] == ']': count -= 1
        end += 1
    
    array_content = content[start:end-1] # content inside [ ... ]
    
    # Extract distinct quiz objects. Regex \{ id: \d+,.*?questionData: \[.*?\]\s*\} could work if greedy/non-greedy is handled right
    # But we have nested arrays (questionData).
    
    # Let's iterate by "id: " which denotes start of a quiz usually
    quiz_chunks = re.split(r'\s*{\s*id:\s*\d+,', array_content)
    # The first chunk is empty or garbage, subsequent chunks start after "id: N,"
    
    # Actually, better: find all "id: \d+," that are at depth 1 (quiz level) vs depth 2 (question level).
    # Quiz IDs are 101, 102, 201 etc. Question IDs are 1, 2, 3...
    # So we can look for 3-digit IDs.
    
    # Or just Regex to extract properties.
    # We want: id, title, unit, difficulty, time, questions, xp, questionData.
    
    # Strategy: Find "id: XXX," then parse forward until "questionData: [". 
    # Capture everything inside questionData: [...] using bracket counting.
    
    current_pos = 0
    while True:
        # Find next quiz ID (3 digits)
        id_match = re.search(r'id:\s*(\d{3}),', content[current_pos:])
        if not id_match: break
        
        q_id = id_match.group(1)
        match_start = current_pos + id_match.start()
        
        # Extract fields
        # Look for the object start "{" before this ID
        obj_start = content.rfind('{', 0, match_start)
        
        # Find questionData start
        qd_start_match = re.search(r'questionData:\s*\[', content[match_start:])
        if not qd_start_match: break
        
        qd_start_idx = match_start + qd_start_match.end()
        
        # Bracket count for questionData
        qd_count = 1
        qd_end_idx = qd_start_idx
        while qd_count > 0 and qd_end_idx < len(content):
            if content[qd_end_idx] == '[': qd_count += 1
            elif content[qd_end_idx] == ']': qd_count -= 1
            qd_end_idx += 1
            
        question_data_str = content[qd_start_idx:qd_end_idx-1]
        
        # Parse simple fields from the text between obj_start and qd_start
        header_text = content[obj_start:qd_start_idx]
        
        title = re.search(r"title:\s*['\"](.*?)['\"]", header_text).group(1)
        unit = re.search(r"unit:\s*['\"](.*?)['\"]", header_text).group(1)
        unit_id = re.sub(r'\D', '', unit)
        if not unit_id: unit_id = '1'
        
        difficulty = re.search(r"difficulty:\s*['\"](.*?)['\"]", header_text).group(1)
        
        time_match = re.search(r"time:\s*['\"](\d+)\s*min['\"]", header_text)
        time_sec = int(time_match.group(1)) * 60 if time_match else 900
        
        xp_match = re.search(r"xp:\s*(\d+)", header_text)
        xp = xp_match.group(1) if xp_match else '50'
        
        questions_count_match = re.search(r"questions:\s*(\d+)", header_text)
        questions_count = questions_count_match.group(1) if questions_count_match else '0'

        # Now clean up question_data_str to be valid JSON
        # It has single quotes, keys without quotes.
        # title: '...', -> "title": "...",
        # id: 1, -> "id": 1,
        
        # Simple transform for known fields
        qd_json = question_data_str
        # keys
        qd_json = re.sub(r'(\s)(\w+):', r'\1"\2":', qd_json)
        # single quoted strings to double
        # Warning: explanation text might have apostrophes like "agent's". 
        # But in the file they seem to use single quotes for strings: 'explanation'.
        # We need to escape inner single quotes or handle them.
        # Actually, let's just use Python to parse the JS object literal syntax broadly if possible, or use strict regex replacement.
        
        # Safer replacement:
        # 1. Replace start/end quotes of values
        # This is hard with regex. 
        # Let's just create a parser for the specific format in the file.
        
        questions = []
        # Find individual question objects
        q_matches = re.finditer(r'\{\s*"id":', qd_json) # keys usually converted by above regex
        
        # Recalculate qd_json manually matching the text
        
        # Parse questions manually from the raw string to avoid regex hell
        raw_qs = question_data_str
        
        # Split by "},"
        raw_q_list = raw_qs.split('},')
        clean_questions = []
        
        for rq in raw_q_list:
            if 'id:' not in rq: continue
            
            # Extract fields
            qid_m = re.search(r'id:\s*(\d+)', rq)
            if not qid_m: continue
            
            q_text_m = re.search(r"question:\s*(['\"`])(.*?)\1", rq, re.DOTALL) # Capture quote type
            q_text = q_text_m.group(2) if q_text_m else "Question text missing"
            
            # Handle Options array
            # options: ['A', 'B', ...]
            opts_m = re.search(r"options:\s*\[(.*?)\]", rq, re.DOTALL)
            options = []
            if opts_m:
                 # split by comma, clean quotes
                 opts_raw = opts_m.group(1).split(',')
                 for o in opts_raw:
                     o = o.strip()
                     if (o.startswith("'") and o.endswith("'")) or (o.startswith('"') and o.endswith('"')):
                         options.append(o[1:-1])
            
            correct_m = re.search(r"correct:\s*(\d+)", rq)
            correct = int(correct_m.group(1)) if correct_m else 0
            
            exp_m = re.search(r"explanation:\s*(['\"`])(.*?)\1", rq, re.DOTALL)
            explanation = exp_m.group(2) if exp_m else ""
            
            topics_m = re.search(r"topics:\s*\[(.*?)\]", rq)
            topics = []
            if topics_m:
                ts = topics_m.group(1).split(',')
                for t in ts:
                    t = t.strip()
                    if t: topics.append(t.replace("'", "").replace('"', ""))

            clean_questions.append({
                "id": int(qid_m.group(1)),
                "question": q_text,
                "options": options,
                "correct": correct,
                "explanation": explanation,
                "topics": topics
            })
            
        quizzes.append({
            'id': q_id,
            'title': title,
            'unit_id': unit_id,
            'difficulty': difficulty,
            'time': time_sec,
            'xp': xp,
            'questions_count': questions_count, # or len(clean_questions)
            'questions': json.dumps(clean_questions).replace("'", "''") # Escape single quotes for SQL
        })
        
        # Advance
        current_pos = qd_end_idx

    return quizzes


def parse_numerical_file(file_path, default_id):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract Title (Page H1 usually)
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', content)
    title = title_match.group(1) if title_match else "Numerical Task"
    
    # Extract Description / Problem Statement
    # Looking for text inside <p> after some header or specific class
    # aiml.tsx uses "description" property. Here we extract from JSX.
    # Let's look for the large description paragraph.
    # Heuristic: Find text inside <p ... leading-relaxed ...>
    desc_match = re.search(r'<p[^>]*leading-relaxed[^>]*>(.*?)</p>', content, re.DOTALL)
    description = desc_match.group(1).strip() if desc_match else "Solve the problem."
    description = re.sub(r'\s+', ' ', description) # Clean whitespace

    # Extract Difficulty
    diff_match = re.search(r'<Badge[^>]*variant="warning"[^>]*>(.*?)</Badge>', content) # Warning usually implies "Medium" in this codebase?
    difficulty = diff_match.group(1) if diff_match else "Medium"
    
    # Extract XP if possible (maxXp variable)
    xp_match = re.search(r'const maxXp = (\d+);', content)
    xp = xp_match.group(1) if xp_match else "50"

    return {
        "id": default_id,
        "title": title,
        "desc": description,
        "difficulty": difficulty,
        "xp": xp
    }

def generate_sql():
    # Hardcoded mapping of file to ID requested (implied)
    numericals = []
    
    # BFS (numericals.tsx) -> ID 101
    bfs_data = parse_numerical_file('lib/numericals/aiml/numericals.tsx', 101)
    numericals.append(bfs_data)
    
    # DFS (numerical_dfs.tsx) -> ID 102 (New ID)
    dfs_data = parse_numerical_file('lib/numericals/aiml/numerical_dfs.tsx', 102)
    numericals.append(dfs_data)

    quizzes = parse_quizzes('lib/quizzes/aiml/quizzes.tsx')
    
    sql = ["-- Auto-generated Seed Script for LearnLabz AIML"]
    
    # Numericals
    sql.append("\n-- Numericals (BFS and DFS)")
    sql.append("INSERT INTO numericals (numerical_id, course_id, lesson_id, numerical_title, numerical_problem_statement, numerical_difficulty, numerical_max_cp, numerical_active, numerical_order_index) VALUES")
    
    num_values = []
    for n in numericals:
        # Escape single quotes in description/title
        title = n['title'].replace("'", "''")
        desc = n['desc'].replace("'", "''")
        diff = n['difficulty'].replace("'", "''")
        
        val = f"({n['id']}, 1, 1, '{title}', '{desc}', '{diff}', {n['xp']}, true, {n['id']})"
        num_values.append(val)
        
    sql.append(",\n".join(num_values))
    sql.append("ON CONFLICT (numerical_id) DO UPDATE SET numerical_title = EXCLUDED.numerical_title, numerical_problem_statement = EXCLUDED.numerical_problem_statement, numerical_difficulty = EXCLUDED.numerical_difficulty, numerical_max_cp = EXCLUDED.numerical_max_cp, numerical_active = EXCLUDED.numerical_active;")
    
    # Quizzes
    sql.append("\n-- Quizzes") 
    sql.append("INSERT INTO quizzes (quiz_id, course_id, unit_id, quiz_title, quiz_difficulty, quiz_pass_score, total_questions, quiz_time, quiz_xp, quiz_order_index, quiz_lesson_mapping) VALUES")
    
    quiz_values = []
    for q in quizzes:
        # JSON string is already escaped for Python string, but needs SQL escaping
        # We used replace("'", "''") in parse_quizzes already for the JSON part?
        # Let's check parse_quizzes implementation. It did: json.dumps(...).replace("'", "''")
        # So q['questions'] is ready for SQL.
        
        title = q['title'].replace("'", "''")
        diff = q['difficulty'].replace("'", "''")
        
        val = f"({q['id']}, 1, {q['unit_id']}, '{title}', '{diff}', 70, {q['questions_count']}, {q['time']}, {q['xp']}, {q['id']}, '{q['questions']}'::jsonb)"
        quiz_values.append(val)
        
    sql.append(",\n".join(quiz_values))
    sql.append("ON CONFLICT (quiz_id) DO UPDATE SET quiz_title = EXCLUDED.quiz_title, quiz_difficulty = EXCLUDED.quiz_difficulty, quiz_pass_score = EXCLUDED.quiz_pass_score, total_questions = EXCLUDED.total_questions, quiz_time = EXCLUDED.quiz_time, quiz_xp = EXCLUDED.quiz_xp, quiz_lesson_mapping = EXCLUDED.quiz_lesson_mapping;")
    
    with open('seed_aiml.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(sql))
        
    print("SQL Generated successfully.")

if __name__ == "__main__":
    generate_sql()

