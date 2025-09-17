const express = require('express');
const router = express.Router();
const { createPoll, getPoll } = require('../controllers/pollController');

router.post('/', createPoll);
router.get('/:id', getPoll);

module.exports = router;