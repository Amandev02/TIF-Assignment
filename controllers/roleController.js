const Community = require('../models/Community');
const User = require('../models/User');
const Role = require('../models/Role');
const Member = require('../models/Membership');

// Create role route
module.exports.createrole_post = async (req,res) => {
    try {
        const { name } = req.body;
    
        // Check if the role already exists
        const existingRole = await Role.findOne({ name });
    
        if (existingRole) {
          return res.status(400).json({ status: false, error: 'Role already exists' });
        }
    
        // Create the role
        const role = await Role.create({ name });
    
        // Construct the desired response format
        const response = {
          status: true,
          content: {
            data: {
              id: role._id, // Assuming _id is the unique identifier for roles
              name: role.name,
              created_at: role.createdAt,
              updated_at: role.updatedAt,
            }
          }
        };
    
        res.json(response);
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
      }
}

// Get all roles route
module.exports.allroles_get = async (req,res) => {
    try {
        const roles = await Role.find();
        
        const roleData = roles.map(role => ({
          id: role._id,
          name: role.name,
          created_at: role.created_at,
          updated_at: role.updated_at,
        }));
    
        const response = {
          status: true,
          content: {
            data: roleData,
          },
        };
    
        res.json(response);
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
      }
}