// controllers/campaignControllers.js
import connection from '../db.js';

// Create Campaign
export const createCampaign = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

<<<<<<< HEAD
  const { title, description, goal_amount, shortDescription, endDate, imageFile} = req.body;
  const created_by = req.user.user_id; // Assuming you have user information from JWT

  // Validate required fields
  if (!title || !description || goal_amount === undefined || !shortDescription || !endDate || !imageFile) {
=======
  const { title, description, goal_amount } = req.body;
  const created_by = req.user.user_id; // Assuming you have user information from JWT

  // Validate required fields
  if (!title || !description || goal_amount === undefined) {
>>>>>>> 6d9184a65caaaa431edcf6efd8a9567c59aa4a50
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Insert campaign into the database
<<<<<<< HEAD
  const query = 'INSERT INTO Campaigns (title, description, goal_amount, created_by, status, short_description, deadline, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(query, [title, description, goal_amount, created_by, 'pending', shortDescription, endDate, imageFile], (err, results) => {
=======
  const query = 'INSERT INTO Campaigns (title, description, goal_amount, created_by, status) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [title, description, goal_amount, created_by, 'pending'], (err, results) => {
>>>>>>> 6d9184a65caaaa431edcf6efd8a9567c59aa4a50
    if (err) {
      console.error('Error executing insert query:', err);
      return res.status(500).json({ success: false, message: 'Error executing query', error: err.message });
    }
    res.status(201).json({ success: true, message: 'Campaign created successfully', campaign_id: results.insertId });
  });
};

// Read All Campaigns
export const getCampaigns = (req, res) => {
  const query = 'SELECT * FROM Campaigns WHERE status = "pending"';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching campaigns:', err);
      return res.status(500).json({ success: false, message: 'Error fetching campaigns' });
    }
    res.status(200).json({ success: true, campaigns: results });
  });
};

// Update Campaign
export const updateCampaign = (req, res) => {
  const { campaign_id, title, description, goal_amount } = req.body;

  // Validate required fields
  if (!campaign_id || !title || !description || goal_amount === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const query = 'UPDATE Campaigns SET title = ?, description = ?, goal_amount = ? WHERE campaign_id = ?';
  connection.query(query, [title, description, goal_amount, campaign_id], (err, results) => {
    if (err) {
      console.error('Error updating campaign:', err);
      return res.status(500).json({ success: false, message: 'Error updating campaign' });
    }
    res.status(200).json({ success: true, message: 'Campaign updated successfully' });
  });
};

// Delete Campaign
export const deleteCampaign = (req, res) => {
  const { campaign_id } = req.body;

  // Validate required fields
  if (!campaign_id) {
    return res.status(400).json({ success: false, message: 'Missing campaign ID' });
  }

  const query = 'UPDATE Campaigns SET status = "deleted" WHERE campaign_id = ?'; // Soft delete
  connection.query(query, [campaign_id], (err, results) => {
    if (err) {
      console.error('Error deleting campaign:', err);
      return res.status(500).json({ success: false, message: 'Error deleting campaign' });
    }
    res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
  });
<<<<<<< HEAD
};
=======
};
>>>>>>> 6d9184a65caaaa431edcf6efd8a9567c59aa4a50
