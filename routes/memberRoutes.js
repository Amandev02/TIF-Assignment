const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');


// Add member route
router.post('/', memberController.addmember_post);

// Remove member route
router.delete('/:id', memberController.member_delete);

module.exports = router;
