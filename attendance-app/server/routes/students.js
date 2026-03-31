const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/students/section/:sectionId
router.get('/section/:sectionId', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('section_id', req.params.sectionId)
    .order('order_num');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
