const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/reports/daily/:date
// Returns all absent/late students grouped by grade and section
router.get('/daily/:date', async (req, res) => {
  const { date } = req.params;

  // Get all attendance records for this date that are absent
  const { data: absences, error } = await supabase
    .from('attendance')
    .select(`
      status,
      periods(period_num, section_id),
      students(name, section_id, sections(name, grade_id, grades(name, color)))
    `)
    .eq('date', date)
    .eq('status', 'absent');

  if (error) return res.status(500).json({ error: error.message });

  // Group by student, collect missed periods
  const studentMap = {};
  for (const record of absences) {
    const student = record.students;
    const section = student?.sections;
    const grade = section?.grades;
    const periodNum = record.periods?.period_num;
    const key = `${student?.name}_${student?.section_id}`;

    if (!studentMap[key]) {
      studentMap[key] = {
        studentName: student?.name,
        sectionName: section?.name,
        gradeName: grade?.name,
        gradeColor: grade?.color,
        missedPeriods: [],
        status: record.status
      };
    }
    if (periodNum) studentMap[key].missedPeriods.push(periodNum);
  }

  // Sort missed periods
  const result = Object.values(studentMap).map(s => ({
    ...s,
    missedPeriods: s.missedPeriods.sort((a, b) => a - b)
  }));

  // Sort by grade order then student name
  result.sort((a, b) => a.gradeName?.localeCompare(b.gradeName) || a.studentName?.localeCompare(b.studentName));

  res.json(result);
});

// GET /api/reports/stats/:date
// Returns attendance statistics per grade
router.get('/stats/:date', async (req, res) => {
  const { date } = req.params;

  // Get all grades with sections and students
  const { data: grades, error: gErr } = await supabase
    .from('grades')
    .select('id, name, color, sections(id, periods(id), students(id, section_id))')
    .order('order_num');

  if (gErr) return res.status(500).json({ error: gErr.message });

  // Get all attendance records for this date
  const { data: attendanceRecords, error: aErr } = await supabase
    .from('attendance')
    .select('student_id, status')
    .eq('date', date);

  if (aErr) return res.status(500).json({ error: aErr.message });

  // Map section periods count
  const sectionPeriodMap = {};
  for (const grade of grades) {
    for (const section of grade.sections) {
      sectionPeriodMap[section.id] = section.periods ? section.periods.length : 5;
    }
  }

  const stats = grades.map(grade => {
    const students = grade.sections.flatMap(s => s.students);

    let presentCount = 0;
    let absentCount = 0;

    for (const student of students) {
      const studentRecords = attendanceRecords.filter(r => r.student_id === student.id);
      
      const expectedPeriods = sectionPeriodMap[student.section_id] || 5;

      const absentRecordsCount = studentRecords.filter(r => r.status === 'absent').length;
      const presentRecordsCount = studentRecords.filter(r => r.status === 'present').length;
      
      // A student is only "decided" if they have exactly the expected number of periods 
      // marked as either 'present' or 'absent'. If they have missing records or explicitly 
      // 'none' (dash), they do not count in the stats.
      const totalDecided = absentRecordsCount + presentRecordsCount;

      if (totalDecided === expectedPeriods) {
        if (absentRecordsCount > 0) {
          absentCount++;
        } else if (presentRecordsCount === expectedPeriods) {
          presentCount++;
        }
      }
    }

    const totalValid = presentCount + absentCount; // Dash state students are omitted from total

    return {
      gradeId: grade.id,
      gradeName: grade.name,
      gradeColor: grade.color,
      total: totalValid,
      presentCount,
      absentCount,
      presentPercent: totalValid > 0 ? Math.round((presentCount / totalValid) * 100) : 0,
      absentPercent: totalValid > 0 ? Math.round((absentCount / totalValid) * 100) : 0,
    };
  });

  res.json(stats);
});

module.exports = router;
