const Community = require('../models/Community');
const User = require('../models/User');
const Role = require('../models/Role');
const Member = require('../models/Membership');

// Add member route
module.exports.addmember_post = async (req,res) => {
    try {
        const { community: communityId, user: userId, role: roleId } = req.body;
    
        // Validate that community, user, and role exist
        const community = await Community.findById(communityId);
        const user = await User.findById(userId);
        const role = await Role.findById(roleId);
    
        if (!community || !user || !role) {
          return res.status(400).json({ status: false, error: 'Invalid community, user, or role ID' });
        }
    
        // Create a new member
        const newMember = new Member({
          community: communityId,
          user: userId,
          role: roleId,
        });
    
        // Save the member to the database
        const savedMember = await newMember.save();
    
        res.json({
          status: true,
          content: {
            data: {
              id: savedMember._id,
              community: communityId,
              user: userId,
              role: roleId,
              created_at: savedMember.createdAt,
            },
          },
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
      }
}

// Remove member route
module.exports.member_delete = async (req,res) => {
    try {
        const memberId = req.params.id;
    
        // Find and remove the member by ID
        const removedMember = await Member.deleteOne({ _id: memberId });
    
        // Check if the member exists
        if (!removedMember) {
          return res.status(404).json({ status: false, error: 'Member not found' });
        }
    
        res.json({
          status: true,
          content: {
            message: 'Member removed successfully',
          },
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
      }
}