const express = require('express');
const router = express.Router();
const {
  createIssue,
  listIssues,
  getIssue,
  updateIssue,
  deleteIssue,
} = require('../controllers/issueController');

// CRUD-Routen fuer /api/issues
router.post('/', createIssue);        // Create
router.get('/', listIssues);          // Read (Liste, optional gefiltert)
router.get('/:id', getIssue);         // Read (einzeln)
router.put('/:id', updateIssue);      // Update
router.delete('/:id', deleteIssue);   // Delete

module.exports = router;
