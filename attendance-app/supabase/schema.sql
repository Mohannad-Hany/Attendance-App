-- ================================================
-- ATTENDANCE APP - SUPABASE SCHEMA + SEED DATA
-- Run this in your Supabase SQL Editor
-- ================================================

-- Drop existing tables (for fresh setup)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS periods CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;

-- =====================
-- GRADES (الصفوف)
-- =====================
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,             -- e.g. "عاشر"
  color TEXT NOT NULL,            -- CSS color class
  order_num INT NOT NULL
);

-- =====================
-- SECTIONS (الفصول)
-- =====================
CREATE TABLE sections (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,             -- e.g. "فصل 1"
  grade_id INT REFERENCES grades(id) ON DELETE CASCADE
);

-- =====================
-- STUDENTS (الطالبات)
-- =====================
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  section_id INT REFERENCES sections(id) ON DELETE CASCADE,
  order_num INT NOT NULL DEFAULT 1
);

-- =====================
-- TEACHERS (الأساتذة)
-- =====================
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

-- =====================
-- PERIODS (الحصص per section)
-- =====================
CREATE TABLE periods (
  id SERIAL PRIMARY KEY,
  period_num INT NOT NULL,        -- 1 to 5
  section_id INT REFERENCES sections(id) ON DELETE CASCADE,
  teacher_id INT REFERENCES teachers(id)
);

-- =====================
-- ATTENDANCE (الحضور)
-- =====================
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  period_id INT REFERENCES periods(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'absent'  -- 'present', 'absent', 'late'
);

-- Unique constraint: one record per student per period per day
ALTER TABLE attendance ADD CONSTRAINT attendance_unique UNIQUE (student_id, period_id, date);

-- ========================
-- ENABLE ROW LEVEL SECURITY
-- ========================
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for all tables (simple setup, no auth)
CREATE POLICY "Allow all" ON grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON periods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- ========================
-- SEED DATA
-- ========================

-- Teachers
INSERT INTO teachers (name) VALUES
  ('أ. أنوار العازمي'),
  ('أ. شيماء سامي'),
  ('أ. إيمان المنير'),
  ('أ. هاجر المطيري'),
  ('أ. رهف المطيري'),
  ('أ. نورة الشمري'),
  ('أ. سارة الحربي'),
  ('أ. منى العتيبي'),
  ('أ. لمياء القحطاني'),
  ('أ. ريم الرشيدي');

-- Grades
INSERT INTO grades (name, color, order_num) VALUES
  ('عاشر', 'teal', 1),
  ('11 أدبي', 'purple', 2),
  ('11 علمي', 'blue', 3),
  ('12 أدبي', 'pink', 4),
  ('12 علمي', 'indigo', 5);

-- Sections for Grade "عاشر" (id=1)
INSERT INTO sections (name, grade_id) VALUES
  ('فصل 1', 1),
  ('فصل 2', 1),
  ('فصل 3', 1);

-- Sections for Grade "11 أدبي" (id=2)
INSERT INTO sections (name, grade_id) VALUES
  ('فصل 1', 2),
  ('فصل 2', 2);

-- Sections for Grade "11 علمي" (id=3)
INSERT INTO sections (name, grade_id) VALUES
  ('فصل 1', 3),
  ('فصل 2', 3);

-- Sections for Grade "12 أدبي" (id=4)
INSERT INTO sections (name, grade_id) VALUES
  ('فصل 1', 4),
  ('فصل 2', 4);

-- Sections for Grade "12 علمي" (id=5)
INSERT INTO sections (name, grade_id) VALUES
  ('فصل 1', 5),
  ('فصل 2', 5);

-- Students for Section 1 (عاشر - فصل 1)
INSERT INTO students (name, section_id, order_num) VALUES
  ('آلاء إبراهيم عبدالله الكندري', 1, 1),
  ('أروى عبدالعزيز فيصل المهيني', 1, 2),
  ('أوراد صالح حسن الكردي', 1, 3),
  ('الحوراء عبدالله مكي عبدالله', 1, 4),
  ('الدانه سعد بطي القحطاني', 1, 5),
  ('حصة عبدالله ضاوي العتيبي', 1, 6),
  ('اوراد بدر عمر حاي', 1, 7),
  ('بتول حسن يوسف الحداد', 1, 8),
  ('رهف محمد علي الرشيدي', 1, 9),
  ('سارة خالد عبدالله الشمري', 1, 10);

-- Students for Section 2 (عاشر - فصل 2)
INSERT INTO students (name, section_id, order_num) VALUES
  ('نورة أحمد سعد العنزي', 2, 1),
  ('منى خالد إبراهيم الحربي', 2, 2),
  ('لمياء فهد ناصر القحطاني', 2, 3),
  ('ريم عبدالله سلمان الرشيدي', 2, 4),
  ('هنا محمد راشد المطيري', 2, 5),
  ('شيماء علي حسين العتيبي', 2, 6),
  ('دانه سعود عبدالله الشمري', 2, 7),
  ('غدير يوسف ناصر الكندري', 2, 8);

-- Students for Section 3 (عاشر - فصل 3)
INSERT INTO students (name, section_id, order_num) VALUES
  ('ميساء عبدالرحمن السلطان', 3, 1),
  ('ندى حمد فهد العجمي', 3, 2),
  ('سلمى إبراهيم عيسى الدوسري', 3, 3),
  ('جواهر ناصر خالد المري', 3, 4),
  ('هيا محمد سالم الهاجري', 3, 5);

-- Students for Section 4 (11 أدبي - فصل 1)
INSERT INTO students (name, section_id, order_num) VALUES
  ('أسماء عبدالله ناصر الفلاحي', 4, 1),
  ('بسمة راشد محمد الكعبي', 4, 2),
  ('تسنيم علي أحمد السبيعي', 4, 3),
  ('جوري خليل عمر الحمادي', 4, 4),
  ('حصة فهد سعد البلوشي', 4, 5),
  ('خلود يوسف ناصر الشهراني', 4, 6),
  ('دلال سعود محمد العمر', 4, 7);

-- Students for Section 5 (11 أدبي - فصل 2)
INSERT INTO students (name, section_id, order_num) VALUES
  ('رنا حمد عبدالله الغامدي', 5, 1),
  ('زينب علي حسين الموسى', 5, 2),
  ('سمية خالد راشد الخليفي', 5, 3),
  ('شهد ناصر محمد العنزي', 5, 4),
  ('طيف سالم أحمد الزهراني', 5, 5);

-- Students for Section 6 (11 علمي - فصل 1)
INSERT INTO students (name, section_id, order_num) VALUES
  ('عائشة فهد علي القحطاني', 6, 1),
  ('فاطمة خليل محمد الراشدي', 6, 2),
  ('قمر يوسف سعد الدوسري', 6, 3),
  ('كريمة أحمد ناصر العازمي', 6, 4),
  ('لجين عبدالله سالم المطيري', 6, 5),
  ('مريم راشد فهد الشريف', 6, 6);

-- Students for Section 7 (11 علمي - فصل 2)
INSERT INTO students (name, section_id, order_num) VALUES
  ('نجود حمد خليل الهاشمي', 7, 1),
  ('هيفاء محمد علي الرشيدي', 7, 2),
  ('وفاء سعود أحمد الحربي', 7, 3),
  ('يارا ناصر عبدالله الشمري', 7, 4);

-- Students for Section 8 (12 أدبي - فصل 1)
INSERT INTO students (name, section_id, order_num) VALUES
  ('أمل خالد فهد العتيبي', 8, 1),
  ('بيان راشد يوسف الكندري', 8, 2),
  ('تالا محمد سالم القرني', 8, 3),
  ('جنان علي حسين الرويلي', 8, 4),
  ('حنين عبدالله أحمد البلوشي', 8, 5);

-- Students for Section 9 (12 أدبي - فصل 2)
INSERT INTO students (name, section_id, order_num) VALUES
  ('خيرية ناصر محمد السيف', 9, 1),
  ('دينا سعود فهد العجمي', 9, 2),
  ('ربى خليل علي المنصور', 9, 3),
  ('زهراء يوسف راشد العنزي', 9, 4);

-- Students for Section 10 (12 علمي - فصل 1)
INSERT INTO students (name, section_id, order_num) VALUES
  ('سحر أحمد ناصر الغامدي', 10, 1),
  ('شروق محمد عبدالله المري', 10, 2),
  ('ضحى فهد سعد الزهراني', 10, 3),
  ('عبير خالد علي القرشي', 10, 4),
  ('فرح راشد يوسف الشهري', 10, 5),
  ('قيس ناصر محمد العمر', 10, 6);

-- Students for Section 11 (12 علمي - فصل 2)
INSERT INTO students (name, section_id, order_num) VALUES
  ('لولو عبدالله أحمد الحارثي', 11, 1),
  ('مشاعل سعود خليل السلمي', 11, 2),
  ('نرجس محمد فهد الرشيدي', 11, 3),
  ('هنوف ناصر علي العتيبي', 11, 4);

-- Periods for all sections (5 periods each, assign teachers)
-- Section 1 (عاشر فصل 1)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 4), (5, 1, 5);

-- Section 2 (عاشر فصل 2)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 2, 6), (2, 2, 7), (3, 2, 8), (4, 2, 9), (5, 2, 10);

-- Section 3 (عاشر فصل 3)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 3, 1), (2, 3, 3), (3, 3, 5), (4, 3, 7), (5, 3, 9);

-- Section 4 (11 أدبي فصل 1)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 4, 2), (2, 4, 4), (3, 4, 6), (4, 4, 8), (5, 4, 10);

-- Section 5 (11 أدبي فصل 2)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 5, 1), (2, 5, 2), (3, 5, 3), (4, 5, 4), (5, 5, 5);

-- Section 6 (11 علمي فصل 1)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 6, 6), (2, 6, 7), (3, 6, 8), (4, 6, 9), (5, 6, 10);

-- Section 7 (11 علمي فصل 2)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 7, 1), (2, 7, 3), (3, 7, 5), (4, 7, 7), (5, 7, 9);

-- Section 8 (12 أدبي فصل 1)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 8, 2), (2, 8, 4), (3, 8, 6), (4, 8, 8), (5, 8, 10);

-- Section 9 (12 أدبي فصل 2)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 9, 1), (2, 9, 2), (3, 9, 3), (4, 9, 4), (5, 9, 5);

-- Section 10 (12 علمي فصل 1)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 10, 6), (2, 10, 7), (3, 10, 8), (4, 10, 9), (5, 10, 10);

-- Section 11 (12 علمي فصل 2)
INSERT INTO periods (period_num, section_id, teacher_id) VALUES
  (1, 11, 1), (2, 11, 3), (3, 11, 5), (4, 11, 7), (5, 11, 9);
