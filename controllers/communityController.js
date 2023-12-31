const Community = require('../models/Community');
const User = require('../models/User');
const Role = require('../models/Role');
const Member = require('../models/Membership');


// Create community route
module.exports.community_post = async (req,res) => {
  try {
    const { name } = req.body;
    // console.log(req);
    const ownerId = req.userId; // Assuming you have a user object in the request (from authentication middleware)

    // Validate the name (required, min: 2)
    if (!name || name.length < 2) {
      return res.status(400).json({ status: false, error: 'Invalid community name' });
    }

    // Generate a unique slug based on the community name
    const slug = generateUniqueSlug(name);

    // Create the community
    const community = await Community.create({ name, slug, owner: ownerId });

    // Create the Member for the owner with "Community Admin" role
    const adminRole = await Role.findOne({ name: 'Community Admin' }); // Assuming you have a Role model
    console.log(adminRole);
    const Membership = await Member.create({
      community: community._id,
      user: ownerId,
      role: adminRole._id, 
    });

    // Add the Member to the community's members array
    community.members.push(Membership._id);
    await community.save();

    // Fetch owner details from the User model (replace with your User model details)
    const owner = await User.findById(ownerId);

    const response = {
      status: true,
      content: {
        data: {
          id: community._id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: owner._id,
            name: owner.name, // Include other owner details as needed
          },
          created_at: community.createdAt,
          updated_at: community.updatedAt,
        }
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
}

// Get all communities route
module.exports.allcommunity_get = async (req,res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const communities = await Community.find()
      .skip(skip)
      .limit(limit);

    const totalCommunities = await Community.countDocuments();

    const communityData = await Promise.all(communities.map(async community => {
      const owner = await User.findById(community.owner);

      return {
        id: community._id,
        name: community.name,
        slug: community.slug,
        owner: {
          id: owner._id,
          name: owner.name,
        },
        created_at: community.createdAt,
        updated_at: community.updatedAt,
      };
    }));

    const totalPages = Math.ceil(totalCommunities / limit);

    const response = {
      status: true,
      content: {
        meta: {
          total: totalCommunities,
          pages: totalPages,
          page: parseInt(page),
        },
        data: communityData,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }

}

// Get all members of a community route
module.exports.allmember_get = async (req,res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Validate slug (add your validation logic here)

    // Find the community by slug
    const community = await Community.findOne({ slug });
    if (!community) {
      return res.status(404).json({ status: false, error: 'Community not found' });
    }

    // Find all Members for the community with pagination
    const Members = await Member.find({ community: community._id })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('role') // Expand role details
      .populate({
        path: 'user',
        select: 'id name', // Select only id and name for the user
      });

    // Fetch total count for pagination
    const totalMembers = await Member.countDocuments({ community: community._id });

    const memberData = Members.map(Member => ({
      id: Member._id,
      community: community._id,
      user: {
        id: Member.user._id,
        name: Member.user.name,
      },
      role: {
        id: Member.role._id,
        name: Member.role.name,
      },
      created_at: Member.createdAt,
    }));

    const totalPages = Math.ceil(totalMembers / limit);

    console.log('Community:', community);
    console.log('Members:', Members);

    const response = {
      status: true,
      content: {
        meta: {
          total: totalMembers,
          pages: totalPages,
          page: parseInt(page),
        },
        data: memberData,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
}

// Get communities owned by the current user route
module.exports.communityowner_get = async (req,res) => {
  try {
    const ownerId = req.userId; // Assuming you have a user object in the request (from authentication middleware)
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find all communities where the user is the owner
    const ownedCommunities = await Community.find({ owner: ownerId })
      .skip(skip)
      .limit(parseInt(limit));

    // If the user doesn't own any communities, return an empty array
    if (!ownedCommunities || ownedCommunities.length === 0) {
      return res.json({
        status: true,
        content: {
          meta: {
            total: 0,
            pages: 0,
            page: parseInt(page),
          },
          data: [],
        },
      });
    }

    // Fetch total count for pagination
    const totalOwnedCommunities = await Community.countDocuments({ owner: ownerId });

    // Fetch details for each owned community
    const ownedCommunityData = ownedCommunities.map(community => ({
      id: community._id,
      name: community.name,
      slug: community.slug,
      owner: community.owner,
      created_at: community.createdAt,
      updated_at: community.updatedAt,
    }));

    const totalPages = Math.ceil(totalOwnedCommunities / limit);

    const response = {
      status: true,
      content: {
        meta: {
          total: totalOwnedCommunities,
          pages: totalPages,
          page: parseInt(page),
        },
        data: ownedCommunityData,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
}

// Get communities joined by the current user route
module.exports.myallcommunity_get = async (req,res) => {
  try {
    
    const memberId = req.userId; // Assuming you have a user object in the request (from authentication middleware)
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Find all Members where the user is a member
    const memberCommunities = await Member.find({ user: memberId })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'community',
        populate: {
          path: 'owner',
          select: 'id name',
        },
      });

    // If the user isn't a member of any communities, return an empty array
    if (!memberCommunities || memberCommunities.length === 0) {
      return res.json({
        status: true,
        content: {
          meta: {
            total: 0,
            pages: 0,
            page: parseInt(page),
          },
          data: [],
        },
      });
    }

    // Fetch total count for pagination
    const totalMemberCommunities = await Member.countDocuments({ user: memberId });
    // console.log(totalMemberCommunities);
    // Fetch details for each joined community
    const memberCommunityData = memberCommunities.map(Member => ({
      id: Member.community._id,
      name: Member.community.name,
      slug: Member.community.slug,
      owner: {
        id: Member.community.owner._id,
        name: Member.community.owner.name,
      },
      created_at: Member.community.createdAt,
      updated_at: Member.community.updatedAt,
    }));

    const totalPages = Math.ceil(totalMemberCommunities / limit);

    const response = {
      status: true,
      content: {
        meta: {
          total: totalMemberCommunities,
          pages: totalPages,
          page: parseInt(page),
        },
        data: memberCommunityData,
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }

}

// Helper function to generate a unique ID (replace with your implementation)
function generateUniqueId() {
  const timestamp = new Date().getTime();
  const uniqueId = `generated-${timestamp}`;
  return uniqueId;
  }
  
  // Helper function to generate a unique slug (replace with your implementation)
  function generateUniqueSlug(name) {
    return name.toLowerCase().replace(/\s+/g, '-'); // Replace with your logic
  }
  

