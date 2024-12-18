import connection from '../db.js';
import jwt from 'jsonwebtoken';

const queryDatabase = (query, params) => {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };

// Fetch user info
export const getUserInfo = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.user_id;

    connection.query('SELECT user_id, first_name, last_name, email, phone, role, age, gender FROM users WHERE user_id = ?', [userId], (err, userResults) => {
      if (err) {
        console.error('Error fetching user info:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const userInfo = { ...userResults[0] };

      connection.query('SELECT address, country, city, postcode FROM address WHERE user_id = ?', [userId], (err, addressResults) => {
        if (err) {
          console.error('Error fetching address info:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        userInfo.address = addressResults.length > 0 ? addressResults[0].address : null;
        userInfo.country = addressResults.length > 0 ? addressResults[0].country : null;

        userInfo.city = addressResults.length > 0 ? addressResults[0].city : null;
        userInfo.postcode = addressResults.length > 0 ? addressResults[0].postcode : null;

        res.json({ success: true, data: userInfo });
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};


// Update user info
export const updateUserInfo = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { first_name, last_name, email, phone, address, city, postcode, age, gender, country } = req.body;
    console.log('Request body:', req.body);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token is missing' });
    }
  
    if (!first_name && !last_name && !email && !phone && !address && !city && !postcode && !age && !gender && !country) {
      return res.status(400).json({ success: false, message: 'At least one field must be provided to update' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decoded.user_id;
  
      const userUpdateResult = await queryDatabase(
        'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, age = ?, gender = ? WHERE user_id = ?',
        [first_name || null, last_name || null, email || null, phone || null, age || null, gender || null, userId]
      );
  
      if (userUpdateResult.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Check if the user has an existing address
      const addressResults = await queryDatabase(
        'SELECT * FROM address WHERE user_id = ?',
        [userId]
      );
  
      if (addressResults.length > 0) {
        // Update address info if it exists
        await queryDatabase(
          'UPDATE address SET address = ?, country = ?, city = ?, postcode = ? WHERE user_id = ?',
          [address || null, country || null, city || null, postcode || null, userId]
        );
      } else {
        // Create a new address entry if it does not exist
        await queryDatabase(
          'INSERT INTO address (user_id, address, country, city, postcode) VALUES (?, ?, ?, ?, ?)',
          [userId, address || null, country || null, city || null, postcode || null]
        );
      }
  
      // Fetch updated user info
      const updatedUserResults = await queryDatabase(
        'SELECT user_id, first_name, last_name, email, phone FROM users WHERE user_id = ?',
        [userId]
      );
  
      if (updatedUserResults.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const updatedUserInfo = { ...updatedUserResults[0] };
  
      // Fetch updated address info
      const updatedAddressResults = await queryDatabase(
        'SELECT address, city, postcode FROM address WHERE user_id = ?',
        [userId]
      );
  
      updatedUserInfo.address = updatedAddressResults.length > 0 ? updatedAddressResults[0].address : null;
      updatedUserInfo.city = updatedAddressResults.length > 0 ? updatedAddressResults[0].city : null;
      updatedUserInfo.postcode = updatedAddressResults.length > 0 ? updatedAddressResults[0].postcode : null;
  
      // Return updated user info as JSON
      res.json({ success: true, message: 'User info updated successfully', data: updatedUserInfo });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };


  export const deleteUser = (req, res) => {
    const { id } = req.params; // Get user ID from route parameters
  
    // SQL query to delete the user
    const query = `
      DELETE FROM users WHERE user_id = ?`;
  
    connection.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    });
  };

  // getCampaigninfo made by each user
  export const getCampaignInfo = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token is missing' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decoded.user_id;
  
      connection.query(
        'SELECT campaign_id, title, goal_amount, status, deadline, image FROM campaigns WHERE created_by = ?',
        [userId],
        (err, campaignResults) => {
          if (err) {
            console.error('Error fetching campaign info:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }
  
          connection.query(
            'SELECT first_name FROM users WHERE user_id = ?',
            [userId],
            (err, userResults) => {
              if (err) {
                console.error('Error fetching user name:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
              }
  
              const userName = userResults[0]?.first_name || 'User';
              const data = {
                campaigns: campaignResults,
                first_name: userName,
              };
  
              res.json({ success: true, data });
            }
          );
        }
      );
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
  // allcampaign for card
  export const getAllCampaign = (req, res) => {
    // Fetch all campaigns along with the first name of the user who created each campaign
    const query = `
 SELECT 
    campaigns.campaign_id, 
    campaigns.title, 
    campaigns.description, 
    campaigns.short_description, 
    campaigns.goal_amount, 
    campaigns.raised_amount, 
    campaigns.status, 
    campaigns.deadline,
    campaigns.image, 
    campaigns.created_by,
    campaigns.phone_number,

    users.first_name,
    campaigncategories.category_name AS campaign_tag
FROM 
    campaigns
JOIN 
    users 
ON 
    campaigns.created_by = users.user_id
LEFT JOIN 
    campaigncategorymapping 
ON 
    campaigns.campaign_id = campaigncategorymapping.campaign_id
LEFT JOIN 
    campaigncategories 
ON 
    campaigncategorymapping.category_id = campaigncategories.category_id
WHERE campaigns.status = 'verified';

  `;
  
  
    connection.query(query, (err, campaignResults) => {
      if (err) {
        console.error('Error fetching campaign info:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
  
      const data = {
        campaigns: campaignResults,
      };
  
      res.json({ success: true, data });
    });
  };


export const getCampaignById = (req, res) => {
    const { id } = req.params; // Get the campaign ID from URL parameters

    // SQL query to fetch campaign data along with the creator's name
    const query = `
      SELECT 
        campaigns.campaign_id AS id,
        campaigns.title,
        campaigns.description,
        campaigns.short_description,
        campaigns.goal_amount,
        campaigns.raised_amount,
        campaigns.status,
        campaigns.deadline,
        campaigns.created_by,
        campaigns.image,
        campaigns.phone_number,

        users.first_name AS firstname,
        users.last_name AS lastname

      FROM campaigns
      JOIN users ON campaigns.created_by = users.user_id
      WHERE campaigns.campaign_id = ?
    `;

    connection.query(query, [id], (err, campaignResults) => {
        if (err) {
            console.error('Error fetching campaign info:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (campaignResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }

        // Return the campaign found
        res.json({ success: true, data: campaignResults[0] });
    });
};

// COUNT Campaign
export const CountAllCampaign = (req, res) => {
  // SQL query to count all campaigns
  const query = `
    SELECT COUNT(campaign_id) AS totalCampaigns FROM campaigns`;

  connection.query(query, (err, campaignResults) => {
      if (err) {
          console.error('Error fetching campaign count:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      // Return the count of campaigns
      res.json({ success: true, data: { totalCampaigns: campaignResults[0].totalCampaigns } });
  });
};

// COUNT USER
export const CountAllUser = (req, res) => {
  // SQL query to count all users
  const query = `
    SELECT COUNT(user_id) AS totalUsers FROM users`;

  connection.query(query, (err, userResults) => {
      if (err) {
          console.error('Error fetching user count:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      // Return the count of users
      res.json({ success: true, data: { totalUsers: userResults[0].totalUsers } });
  });
};

export const CountAllAmount = (req, res) => {
  // SQL query to sum all donation amounts
  const query = `
    SELECT SUM(amount) AS totalAmount FROM donations`;

  connection.query(query, (err, amountResults) => {
      if (err) {
          console.error('Error fetching total amount:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      // Return the total donation amount
      res.json({ success: true, data: { totalAmount: amountResults[0].totalAmount } });
  });
};

export const getDonations = (req, res) => {
  const { id } = req.params;// Extract user_id from route parameters
  // SQL query to fetch donations for the given user_id
  const query = `
    SELECT 
      d.donation_id AS donation_id,
      d.campaign_id,
      d.amount,
      d.transaction_id,
      d.created_at,
      c.title AS campaign_title,
      c.goal_amount,
      c.raised_amount
    FROM donations d
    JOIN campaigns c ON d.campaign_id = c.campaign_id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `;

  connection.execute(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching donations by user:', err);
      return res.status(500).json({ message: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No donations found for this user' });
    }

    res.status(200).json({
      message: 'Donations retrieved successfully',
      donations: results,
    });
  });
};

export const getDonationsByCampaign = (req, res) => {
  const { id } = req.params; // Extract campaignId from route parameters

  const query = `
    SELECT 
      d.donation_id,
      d.amount,
      d.transaction_id,
      d.created_at,
      u.first_name AS donor_first_name,
      u.last_name AS donor_last_name
    FROM donations d
    JOIN users u ON d.user_id = u.user_id
    WHERE d.campaign_id = ?
    ORDER BY d.created_at DESC;
  `;

  connection.execute(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching donations for campaign:', err);
      return res.status(500).json({ message: 'Database query failed' });
    }

    // Return all donations, even if there are no donations
    res.status(200).json({
      message: 'Donations retrieved successfully',
      donations: results, // This will return all donations for the campaign
    });
  });
};

export const getTopContributors = (req, res) => {
  const { id } = req.params; // Extract campaignId from route parameters

  const query = `
    SELECT 
      u.first_name AS donor_first_name,
      u.last_name AS donor_last_name,
      SUM(d.amount) AS total_donated
    FROM donations d
    JOIN users u ON d.user_id = u.user_id
    WHERE d.campaign_id = ?
    GROUP BY d.user_id
    ORDER BY total_donated DESC
    LIMIT 8;
  `;

  connection.execute(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching top contributors for campaign:', err);
      return res.status(500).json({ message: 'Database query failed' });
    }

    // Return the top 8 contributors
    res.status(200).json({
      message: 'Top contributors retrieved successfully',
      top_contributors: results, // This will return the top 8 contributors
    });
  });
};
