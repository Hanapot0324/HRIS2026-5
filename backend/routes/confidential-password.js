const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { authenticateToken, logAudit } = require('../middleware/auth');

// Middleware to check if user is superadmin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Get user role from database
  const query = 'SELECT role FROM users WHERE employeeNumber = ?';
  db.query(query, [req.user.employeeNumber], (err, results) => {
    if (err) {
      console.error('Error checking user role:', err);
      return res.status(500).json({ error: 'Failed to verify user role' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = results[0].role;
    if (userRole !== 'superadmin') {
      return res.status(403).json({ error: 'Access denied. Superadmin role required.' });
    }

    next();
  });
};

// GET: Check if password exists (superadmin only)
router.get('/api/confidential-password/exists', authenticateToken, requireSuperAdmin, (req, res) => {
  const query = 'SELECT id, created_at, updated_at, created_by, updated_by FROM confidential_password ORDER BY id DESC LIMIT 1';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error checking password existence:', err);
      return res.status(500).json({ error: 'Failed to check password existence' });
    }

    res.json({ exists: results.length > 0, passwordInfo: results[0] || null });
  });
});

// POST: Create or update confidential password (superadmin only)
router.post('/api/confidential-password', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { password } = req.body;
  const employeeNumber = req.user.employeeNumber;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if password already exists
    const checkQuery = 'SELECT id FROM confidential_password ORDER BY id DESC LIMIT 1';
    db.query(checkQuery, async (err, results) => {
      if (err) {
        console.error('Error checking existing password:', err);
        return res.status(500).json({ error: 'Failed to check existing password' });
      }

      if (results.length > 0) {
        // Update existing password
        const updateQuery = `
          UPDATE confidential_password 
          SET password_hash = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        db.query(updateQuery, [hashedPassword, employeeNumber, results[0].id], (updateErr) => {
          if (updateErr) {
            console.error('Error updating password:', updateErr);
            return res.status(500).json({ error: 'Failed to update password' });
          }

          // Log audit
          try {
            logAudit(req.user, 'Update', 'confidential_password', results[0].id, null);
          } catch (e) {
            console.error('Audit log error:', e);
          }

          res.json({ message: 'Confidential password updated successfully' });
        });
      } else {
        // Create new password
        const insertQuery = `
          INSERT INTO confidential_password (password_hash, created_by, updated_by) 
          VALUES (?, ?, ?)
        `;
        db.query(insertQuery, [hashedPassword, employeeNumber, employeeNumber], (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Error creating password:', insertErr);
            return res.status(500).json({ error: 'Failed to create password' });
          }

          // Log audit
          try {
            logAudit(req.user, 'Create', 'confidential_password', insertResult.insertId, null);
          } catch (e) {
            console.error('Audit log error:', e);
          }

          res.json({ message: 'Confidential password created successfully' });
        });
      }
    });
  } catch (error) {
    console.error('Error processing password:', error);
    res.status(500).json({ error: 'Failed to process password' });
  }
});

// POST: Verify confidential password (for payroll deletion and audit log viewing)
router.post('/api/confidential-password/verify', authenticateToken, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const query = 'SELECT password_hash FROM confidential_password ORDER BY id DESC LIMIT 1';
    db.query(query, async (err, results) => {
      if (err) {
        console.error('Error fetching password:', err);
        return res.status(500).json({ error: 'Failed to verify password' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Confidential password not set. Please contact superadmin.' });
      }

      const isMatch = await bcrypt.compare(password, results[0].password_hash);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      res.json({ verified: true, message: 'Password verified successfully' });
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Failed to verify password' });
  }
});

module.exports = router;




