const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/attendance/:sectionId/:date
// Returns all attendance records for a section on a given date
// Also returns periods+teachers and students so frontend has everything in one call
router.get('/:sectionId/:date', async (req, res) => {
  const { sectionId, date } = req.params;

  // Get periods for this section with teacher info
  const { data: periods, error: periodsError } = await supabase
    .from('periods')
    .select('*, teachers(name)')
    .eq('section_id', sectionId)
    .order('period_num');

  if (periodsError) return res.status(500).json({ error: periodsError.message });

  // Get students for this section
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('section_id', sectionId)
    .order('order_num');

  if (studentsError) return res.status(500).json({ error: studentsError.message });

  // Get attendance records
  const periodIds = periods.map(p => p.id);
  const studentIds = students.map(s => s.id);

  let attendanceRecords = [];
  if (periodIds.length > 0 && studentIds.length > 0) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .in('period_id', periodIds)
      .in('student_id', studentIds)
      .eq('date', date);

    if (error) return res.status(500).json({ error: error.message });
    attendanceRecords = data;
  }

  res.json({ periods, students, attendance: attendanceRecords });
});

// POST /api/attendance - upsert one attendance cell
router.post('/', async (req, res) => {
  const { student_id, period_id, date, status } = req.body;

  if (!student_id || !period_id || !date || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      { student_id, period_id, date, status },
      { onConflict: 'student_id,period_id,date' }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/attendance/mark-all - mark all students in a section for a period
router.patch('/mark-all', async (req, res) => {
  const { section_id, period_id, date, status } = req.body;

  // Get students in section
  const { data: students, error: sErr } = await supabase
    .from('students')
    .select('id')
    .eq('section_id', section_id);

  if (sErr) return res.status(500).json({ error: sErr.message });

  const records = students.map(s => ({
    student_id: s.id,
    period_id,
    date,
    status
  }));

  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'student_id,period_id,date' })
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
