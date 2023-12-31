const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// Create community route
router.post('/',communityController.community_post);

// Get all communities route
router.get('/',communityController.allcommunity_get);

// Get all members of a community route
router.get('/:slug/members', communityController.allmember_get);

// Get communities owned by the current user route
router.get('/me/owner', communityController.communityowner_get);

// Get communities joined by the current user route
router.get('/me/member',communityController.myallcommunity_get);


module.exports = router;
