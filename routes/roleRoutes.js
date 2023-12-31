const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const roleController = require('../controllers/roleController')


// Create role route
router.post('/', roleController.createrole_post);

// Get all roles route
router.get('/', roleController.allroles_get);

module.exports = router;
