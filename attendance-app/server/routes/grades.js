const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/grades - list all grades with their sections
router.get('/', async (req, res) => {
  const { data: grades, error } = await supabase
    .from('grades')
    .select('*, sections(*)')
    .order('order_num');

  if (error) return res.status(500).json({ error: error.message });
  res.json(grades);
});

// GET /api/grades/:id/sections - sections for a specific grade
router.get('/:id/sections', async (req, res) => {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('grade_id', req.params.id)
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
