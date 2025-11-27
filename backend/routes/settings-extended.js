const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// FAQs ROUTES
// ============================================

// GET all FAQs
router.get('/api/faqs', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM faqs WHERE is_active = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY display_order ASC, id ASC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching FAQs:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
    res.json(results);
  });
});

// GET single FAQ
router.get('/api/faqs/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM faqs WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching FAQ:', err);
      return res.status(500).json({ error: 'Failed to fetch FAQ' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json(results[0]);
  });
});

// POST create FAQ (admin only)
router.post('/api/faqs', authenticateToken, (req, res) => {
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { question, answer, category, display_order } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const query = `
    INSERT INTO faqs (question, answer, category, display_order)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [question, answer, category || 'general', display_order || 0],
    (err, result) => {
      if (err) {
        console.error('Error creating FAQ:', err);
        return res.status(500).json({ error: 'Failed to create FAQ' });
      }
      res.status(201).json({ id: result.insertId, message: 'FAQ created successfully' });
    }
  );
});

// PUT update FAQ (admin only)
router.put('/api/faqs/:id', authenticateToken, (req, res) => {
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { id } = req.params;
  const { question, answer, category, display_order, is_active } = req.body;

  const updates = [];
  const params = [];

  if (question !== undefined) {
    updates.push('question = ?');
    params.push(question);
  }
  if (answer !== undefined) {
    updates.push('answer = ?');
    params.push(answer);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category);
  }
  if (display_order !== undefined) {
    updates.push('display_order = ?');
    params.push(display_order);
  }
  if (is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(is_active);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(id);

  const query = `UPDATE faqs SET ${updates.join(', ')} WHERE id = ?`;

  db.query(query, params, (err) => {
    if (err) {
      console.error('Error updating FAQ:', err);
      return res.status(500).json({ error: 'Failed to update FAQ' });
    }
    res.json({ message: 'FAQ updated successfully' });
  });
});

// DELETE FAQ (admin only)
router.delete('/api/faqs/:id', authenticateToken, (req, res) => {
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { id } = req.params;
  db.query('DELETE FROM faqs WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting FAQ:', err);
      return res.status(500).json({ error: 'Failed to delete FAQ' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  });
});

// ============================================
// USER PREFERENCES ROUTES
// ============================================

// GET user preferences (public endpoint for login check, also supports authenticated)
router.get('/api/user-preferences/:employeeNumber', (req, res) => {
  const { employeeNumber } = req.params;

  db.query(
    'SELECT * FROM user_preferences WHERE employee_number = ?',
    [employeeNumber],
    (err, results) => {
      if (err) {
        console.error('Error fetching user preferences:', err);
        return res.status(500).json({ error: 'Failed to fetch user preferences' });
      }

      if (results.length === 0) {
        // Return default preferences if none exist
        return res.json({
          employee_number: employeeNumber,
          enable_mfa: 1, // Default to enabled
        });
      }

      res.json(results[0]);
    }
  );
});

// PUT update user preferences
router.put('/api/user-preferences/:employeeNumber', authenticateToken, (req, res) => {
  const { employeeNumber } = req.params;
  const { enable_mfa } = req.body;

  // Check if preferences exist
  db.query(
    'SELECT * FROM user_preferences WHERE employee_number = ?',
    [employeeNumber],
    (err, results) => {
      if (err) {
        console.error('Error checking user preferences:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        // Insert new preferences
        db.query(
          'INSERT INTO user_preferences (employee_number, enable_mfa) VALUES (?, ?)',
          [employeeNumber, enable_mfa !== undefined ? (enable_mfa ? 1 : 0) : 1],
          (err, result) => {
            if (err) {
              console.error('Error creating user preferences:', err);
              return res.status(500).json({ error: 'Failed to create preferences' });
            }
            res.json({ message: 'Preferences updated successfully' });
          }
        );
      } else {
        // Update existing preferences
        const updates = [];
        const params = [];

        if (enable_mfa !== undefined) {
          updates.push('enable_mfa = ?');
          params.push(enable_mfa ? 1 : 0);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(employeeNumber);

        db.query(
          `UPDATE user_preferences SET ${updates.join(', ')} WHERE employee_number = ?`,
          params,
          (err) => {
            if (err) {
              console.error('Error updating user preferences:', err);
              return res.status(500).json({ error: 'Failed to update preferences' });
            }
            res.json({ message: 'Preferences updated successfully' });
          }
        );
      }
    }
  );
});

// ============================================
// ABOUT US ROUTES
// ============================================

// GET About Us content
router.get('/api/about-us', (req, res) => {
  db.query('SELECT * FROM about_us ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error fetching About Us:', err);
      return res.status(500).json({ error: 'Failed to fetch About Us content' });
    }

    if (results.length === 0) {
      return res.json({
        title: 'About Us',
        content: '<p>Content coming soon...</p>',
        version: null,
      });
    }

    res.json(results[0]);
  });
});

// PUT update About Us (admin only)
router.put('/api/about-us', authenticateToken, (req, res) => {
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { title, content, version } = req.body;
  const employeeNumber = req.user?.employeeNumber || 'system';

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Check if About Us exists
  db.query('SELECT * FROM about_us ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error checking About Us:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      // Insert new About Us
      db.query(
        'INSERT INTO about_us (title, content, version, last_updated_by) VALUES (?, ?, ?, ?)',
        [title, content, version || null, employeeNumber],
        (err, result) => {
          if (err) {
            console.error('Error creating About Us:', err);
            return res.status(500).json({ error: 'Failed to create About Us' });
          }
          res.json({ id: result.insertId, message: 'About Us created successfully' });
        }
      );
    } else {
      // Update existing About Us
      const id = results[0].id;
      db.query(
        'UPDATE about_us SET title = ?, content = ?, version = ?, last_updated_by = ? WHERE id = ?',
        [title, content, version || null, employeeNumber, id],
        (err) => {
          if (err) {
            console.error('Error updating About Us:', err);
            return res.status(500).json({ error: 'Failed to update About Us' });
          }
          res.json({ message: 'About Us updated successfully' });
        }
      );
    }
  });
});

// ============================================
// CONTACT US ROUTES
// ============================================

// POST create contact message (public - anyone can submit)
router.post('/api/contact-us', authenticateToken, (req, res) => {
  const { name, email, subject, message } = req.body;
  const employeeNumber = req.user?.employeeNumber || null;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const query = `
    INSERT INTO contact_us (name, email, subject, message, employee_number)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, email, subject || null, message, employeeNumber],
    (err, result) => {
      if (err) {
        console.error('Error creating contact message:', err);
        return res.status(500).json({ error: 'Failed to submit contact message' });
      }

      const contactId = result.insertId;
      const submitterName = name || 'A user';
      const notificationDescription = `${submitterName} submitted a new contact ticket${subject ? `: ${subject}` : ''}. Click to view details.`;

      // Send response immediately (don't wait for notifications)
      res.status(201).json({ id: contactId, message: 'Contact message submitted successfully' });

      // Create notifications for all admins and superadmins (async, non-blocking)
      db.query(
        'SELECT employeeNumber FROM users WHERE role IN (?, ?)',
        ['superadmin', 'administrator'],
        (adminErr, admins) => {
          if (adminErr) {
            console.error('Error fetching admins for notification:', adminErr);
            return; // Don't block response
          }

          // Create notifications for each admin
          if (Array.isArray(admins) && admins.length > 0) {
            const notificationPromises = admins.map((admin) => {
              return new Promise((resolve) => {
                const adminEmpNum = String(admin.employeeNumber).trim();
                if (!adminEmpNum) {
                  resolve({ success: false });
                  return;
                }

                // Try with notification_type and action_link
                db.query(
                  `INSERT INTO notifications (employeeNumber, description, read_status, notification_type, action_link) 
                   VALUES (?, ?, 0, 'contact', '/settings')`,
                  [adminEmpNum, notificationDescription],
                  (notifErr) => {
                    if (notifErr) {
                      // Fallback: try without notification_type and action_link
                      db.query(
                        `INSERT INTO notifications (employeeNumber, description, read_status) 
                         VALUES (?, ?, 0)`,
                        [adminEmpNum, notificationDescription],
                        (fallbackErr) => {
                          if (fallbackErr) {
                            console.error(`Error creating notification for admin ${adminEmpNum}:`, fallbackErr);
                            resolve({ success: false });
                          } else {
                            resolve({ success: true });
                          }
                        }
                      );
                    } else {
                      resolve({ success: true });
                    }
                  }
                );
              });
            });

            Promise.all(notificationPromises).then(() => {
              console.log(`Created notifications for ${admins.length} admin(s) about new contact ticket ${contactId}`);
            }).catch((err) => {
              console.error('Error creating notifications:', err);
            });
          }
        }
      );
    }
  );
});

// GET all contact messages (admin only)
router.get('/api/contact-us', authenticateToken, (req, res) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT * FROM contact_us WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching contact messages:', err);
      return res.status(500).json({ error: 'Failed to fetch contact messages' });
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM contact_us WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    db.query(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error('Error counting contact messages:', err);
        return res.status(500).json({ error: 'Failed to count contact messages' });
      }

      res.json({
        data: results,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    });
  });
});

// GET single contact message (admin only)
router.get('/api/contact-us/:id', authenticateToken, (req, res) => {
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { id } = req.params;
  db.query('SELECT * FROM contact_us WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching contact message:', err);
      return res.status(500).json({ error: 'Failed to fetch contact message' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    res.json(results[0]);
  });
});

// PUT update contact message (admin only - for status and notes)
router.put('/api/contact-us/:id', authenticateToken, (req, res) => {
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { id } = req.params;
  const { status, admin_notes } = req.body;

  const updates = [];
  const params = [];

  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (admin_notes !== undefined) {
    updates.push('admin_notes = ?');
    params.push(admin_notes);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(id);

  const query = `UPDATE contact_us SET ${updates.join(', ')} WHERE id = ?`;

  // First, get the contact message to find the submitter
  db.query('SELECT employee_number, name, email FROM contact_us WHERE id = ?', [id], (fetchErr, contactResults) => {
    if (fetchErr) {
      console.error('Error fetching contact message:', fetchErr);
      return res.status(500).json({ error: 'Failed to fetch contact message' });
    }

    if (contactResults.length === 0) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    const contactMessage = contactResults[0];
    const submitterEmployeeNumber = contactMessage.employee_number;

    // Update the contact message
    db.query(query, params, (err) => {
      if (err) {
        console.error('Error updating contact message:', err);
        return res.status(500).json({ error: 'Failed to update contact message' });
      }

      // Create notification for the staff member who submitted the ticket
      // Only if admin_notes was added (meaning admin responded) or status changed to replied/resolved
      if (submitterEmployeeNumber && (admin_notes || (status && ['replied', 'resolved'].includes(status)))) {
        const adminName = req.user?.username || 'Admin';
        let notificationDescription = '';
        
        if (admin_notes) {
          notificationDescription = `Admin ${adminName} has responded to your contact ticket. Click to view response.`;
        } else if (status === 'replied') {
          notificationDescription = `Your contact ticket has been marked as replied by ${adminName}.`;
        } else if (status === 'resolved') {
          notificationDescription = `Your contact ticket has been resolved by ${adminName}.`;
        }

        if (notificationDescription) {
          const submitterEmpNum = String(submitterEmployeeNumber).trim();
          
          // Try with notification_type and action_link
          db.query(
            `INSERT INTO notifications (employeeNumber, description, read_status, notification_type, action_link) 
             VALUES (?, ?, 0, 'contact', '/settings')`,
            [submitterEmpNum, notificationDescription],
            (notifErr) => {
              if (notifErr) {
                // Fallback: try without notification_type and action_link
                db.query(
                  `INSERT INTO notifications (employeeNumber, description, read_status) 
                   VALUES (?, ?, 0)`,
                  [submitterEmpNum, notificationDescription],
                  (fallbackErr) => {
                    if (fallbackErr) {
                      console.error(`Error creating notification for staff ${submitterEmpNum}:`, fallbackErr);
                    } else {
                      console.log(`Created notification for staff ${submitterEmpNum} about contact ticket ${id} response`);
                    }
                  }
                );
              } else {
                console.log(`Created notification for staff ${submitterEmpNum} about contact ticket ${id} response`);
              }
            }
          );
        }
      }

      res.json({ message: 'Contact message updated successfully' });
    });
  });
});

// DELETE contact message (admin only)
router.delete('/api/contact-us/:id', authenticateToken, (req, res) => {
  const userRole = req.user?.role;
  if (userRole !== 'superadmin' && userRole !== 'administrator') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  const { id } = req.params;
  db.query('DELETE FROM contact_us WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error deleting contact message:', err);
      return res.status(500).json({ error: 'Failed to delete contact message' });
    }
    res.json({ message: 'Contact message deleted successfully' });
  });
});

// ============================================
// POLICY ROUTES
// ============================================

// GET Policy content
router.get('/api/policy', (req, res) => {
  db.query('SELECT * FROM policy ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error fetching Policy:', err);
      return res.status(500).json({ error: 'Failed to fetch Policy content' });
    }

    if (results.length === 0) {
      return res.json({
        title: 'Privacy Policy & Terms of Service',
        privacy_policy: '<p>Privacy policy content coming soon...</p>',
        terms_of_service: '<p>Terms of service content coming soon...</p>',
      });
    }

    res.json(results[0]);
  });
});

// PUT update Policy (admin only)
router.put('/api/policy', authenticateToken, (req, res) => {
  const { title, privacy_policy, terms_of_service } = req.body;
  const employeeNumber = req.user?.employeeNumber || 'system';

  if (!privacy_policy || !terms_of_service) {
    return res.status(400).json({ error: 'Privacy policy and terms of service are required' });
  }

  // Check if Policy exists
  db.query('SELECT * FROM policy ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error checking Policy:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      // Insert new Policy
      db.query(
        'INSERT INTO policy (title, privacy_policy, terms_of_service, last_updated_by) VALUES (?, ?, ?, ?)',
        [title || 'Privacy Policy & Terms of Service', privacy_policy, terms_of_service, employeeNumber],
        (err, result) => {
          if (err) {
            console.error('Error creating Policy:', err);
            return res.status(500).json({ error: 'Failed to create Policy' });
          }
          res.json({ id: result.insertId, message: 'Policy created successfully' });
        }
      );
    } else {
      // Update existing Policy
      const id = results[0].id;
      db.query(
        'UPDATE policy SET title = ?, privacy_policy = ?, terms_of_service = ?, last_updated_by = ? WHERE id = ?',
        [title || 'Privacy Policy & Terms of Service', privacy_policy, terms_of_service, employeeNumber, id],
        (err) => {
          if (err) {
            console.error('Error updating Policy:', err);
            return res.status(500).json({ error: 'Failed to update Policy' });
          }
          res.json({ message: 'Policy updated successfully' });
        }
      );
    }
  });
});

module.exports = router;

