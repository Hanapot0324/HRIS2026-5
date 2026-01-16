const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { authenticateToken, logAudit } = require('../middleware/auth');
const transporter = require('../config/email');

// REGISTER - Updated with email notification
router.post('/register', async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    nameExtension,
    email,
    password,
    employeeNumber,
    employmentCategory,
  } = req.body;

  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const fullName = [
      firstName,
      middleName || '',
      lastName,
      nameExtension || '',
    ]
      .filter(Boolean)
      .join(' ');

    const checkQuery = `
      SELECT employeeNumber FROM users WHERE employeeNumber = ? 
      UNION 
      SELECT agencyEmployeeNum FROM person_table WHERE agencyEmployeeNum = ?
    `;

    db.query(
      checkQuery,
      [employeeNumber, employeeNumber],
      (err, existingRecords) => {
        if (err) {
          console.error('Error checking existing records:', err);
          return res
            .status(500)
            .send({ error: 'Failed to check existing records' });
        }

        if (existingRecords.length > 0) {
          return res
            .status(400)
            .send({ error: 'Employee number already exists' });
        }

        // Insert into users table
        const userQuery = `
          INSERT INTO users (
            email,
            role,
            password,
            employeeNumber,
            employmentCategory,
            access_level,
            username
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          userQuery,
          [
            email,
            'staff',
            hashedPass,
            employeeNumber,
            employmentCategory ?? 0,
            'user',
            fullName,
          ],
          (err) => {
            if (err) {
              console.error('Error inserting into users table:', err);
              return res
                .status(500)
                .send({ error: 'Failed to create user record' });
            }

            // Insert into person_table
            const personQuery = `
              INSERT INTO person_table (
                firstName,
                middleName,
                lastName,
                nameExtension,
                agencyEmployeeNum
              ) VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
              personQuery,
              [
                firstName,
                middleName || null,
                lastName,
                nameExtension || null,
                employeeNumber,
              ],
              (err) => {
                if (err) {
                  console.error('Error inserting into person_table:', err);
                  const cleanupQuery =
                    'DELETE FROM users WHERE employeeNumber = ?';
                  db.query(cleanupQuery, [employeeNumber]);
                  return res
                    .status(500)
                    .send({ error: 'Failed to create person record' });
                }

                // INSERT INTO employment_category table
                const empCatQuery = `
                  INSERT INTO employment_category (employeeNumber, employmentCategory)
                  VALUES (?, ?)
                `;

                db.query(
                  empCatQuery,
                  [employeeNumber, employmentCategory ?? 0],
                  async (catErr) => {
                    if (catErr) {
                      console.error(
                        'Error inserting into employment_category:',
                        catErr
                      );
                      db.query(
                        'DELETE FROM person_table WHERE agencyEmployeeNum = ?',
                        [employeeNumber]
                      );
                      db.query('DELETE FROM users WHERE employeeNumber = ?', [
                        employeeNumber,
                      ]);
                      return res.status(500).send({
                        error: 'Failed to create employment category record',
                      });
                    }

                    // SEND EMAIL WITH CREDENTIALS
                    try {
                      await transporter.sendMail({
                        from: `"HRIS System" <${process.env.GMAIL_USER}>`,
                        to: email,
                        subject: 'Welcome to EARIST - Your Login Information',
                        html: `
                          <!DOCTYPE html>
                          <html lang="en">
                          <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>Login Information</title>
                          <style>
                          * { margin: 0; padding: 0; box-sizing: border-box; }
                          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; color: #333333; line-height: 1.6; }
                          .email-wrapper { width: 100%; background-color: #f4f4f4; padding: 30px 15px; }
                          .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                          .email-header { background: linear-gradient(135deg, #6d2323 0%, #8a4747 100%); padding: 30px; text-align: center; }
                          .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; }
                          .email-body { padding: 35px 30px; }
                          .greeting {
                            font-size: 15px;
                            color: #333333;
                            margin-bottom: 15px;
                          }
                          .greeting strong {
                            color: #6d2323;
                          }
                          .intro-text {
                            font-size: 14px;
                            color: #555555;
                            margin-bottom: 25px;
                            line-height: 1.7;
                          }
                          .credentials-box {
                            background: #fafafa;
                            border: 2px solid #f5e6e6;
                            border-radius: 6px;
                            padding: 25px;
                            margin: 25px 0;
                          }
                          .credential-row {
                            margin-bottom: 15px;
                            padding-bottom: 15px;
                            border-bottom: 1px solid #eeeeee;
                          }
                          .credential-row:last-child {
                            margin-bottom: 0;
                            padding-bottom: 0;
                            border-bottom: none;
                          }
                          .credential-label {
                            font-size: 12px;
                            color: #6d2323;
                            font-weight: 600;
                            text-transform: uppercase;
                            margin-bottom: 5px;
                            letter-spacing: 0.5px;
                          }
                          .credential-value {
                            font-size: 15px;
                            color: #2c3e50;
                            font-weight: 500;
                          }
                          .credential-value.highlight {
                            background: #fff8e1;
                            padding: 10px 15px;
                            border-radius: 4px;
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 16px;
                            letter-spacing: 1px;
                            color: #856404;
                            border: 2px solid #ffc107;
                            display: inline-block;
                            margin-top: 5px;
                            font-weight: 700;
                          }
                          .credential-value.empnum {
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 16px;
                            color: #6d2323;
                            font-weight: 700;
                          }
                          .note-box {
                            background: #fff8e1;
                            border-left: 4px solid #6d2323;
                            padding: 15px 20px;
                            margin: 25px 0;
                            border-radius: 4px;
                          }
                          .note-box p {
                            font-size: 13px;
                            color: #555555;
                            margin: 0;
                            line-height: 1.6;
                          }
                          .note-box strong {
                            color: #6d2323;
                          }
                          .action-section {
                            text-align: center;
                            margin: 30px 0 25px;
                          }
                          .action-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #6d2323 0%, #8a4747 100%);
                            color: #ffffff !important;
                            padding: 14px 40px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: 600;
                            font-size: 15px;
                            box-shadow: 0 4px 12px rgba(109, 35, 35, 0.25);
                            transition: all 0.3s ease;
                          }
                          .action-button:hover {
                            background: linear-gradient(135deg, #5a1e1e 0%, #6d2323 100%);
                            transform: translateY(-2px);
                            color: #ffffff !important;
                          }
                          a.action-button {
                            color: #ffffff !important;
                            }
                            a.action-button:visited {
                              color: #ffffff !important;
                            }
                            a.action-button:active {
                              color: #ffffff !important;
                            }
                            .support-text {
                            font-size: 13px;
                            color: #777777;
                            text-align: center;
                            margin-top: 25px;
                            padding-top: 20px;
                            border-top: 1px solid #eeeeee;
                          }
                          .email-footer {
                            background: linear-gradient(135deg, #6d2323 0%, #8a4747 100%);
                            padding: 25px;
                            text-align: center;
                          }
                          .footer-text {
                            font-size: 12px;
                            color: #f5e6e6;
                            margin: 5px 0;
                          }
                          @media only screen and (max-width: 600px) {
                            .email-wrapper {
                              padding: 20px 10px;
                            }
                            .email-body {
                              padding: 25px 20px;
                            }
                            .email-header h1 {
                              font-size: 22px;
                            }
                            .credentials-box {
                              padding: 20px;
                            }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="email-wrapper">
                          <div class="email-container">
                            
                            <!-- Header -->
                            <div class="email-header">
                              <h1>Welcome!</h1>
                            </div>
                            
                            <!-- Body -->
                            <div class="email-body">
                              <p class="greeting">Hello <strong>${fullName}</strong>,</p>
                              
                              <p class="intro-text">
                                Your employee account has been created. You can now access your payslip, 
                                check attendance, and manage your personal information online.
                              </p>
                              
                              <!-- Credentials -->
                              <div class="credentials-box">
                                <div class="credential-row">
                                  <div class="credential-label">Employee Number</div>
                                  <div class="credential-value empnum">${employeeNumber}</div>
                                </div>
                                
                                <div class="credential-row">
                                  <div class="credential-label">Email</div>
                                  <div class="credential-value">${email}</div>
                                </div>
                                
                                <div class="credential-row">
                                  <div class="credential-label">Temporary Password</div>
                                  <div class="credential-value">
                                    <span class="highlight">${password}</span>
                                  </div>
                                </div>
                                
                                <div class="credential-row">
                                  <div class="credential-label">Employment Type</div>
                                  <div class="credential-value">${
                                    employmentCategory === 1
                                      ? 'Regular'
                                      : 'Job Order'
                                  }</div>
                                </div>
                              </div>
                              
                              <!-- Security Note -->
                              <div class="note-box">
                                <p>
                                  <strong>Important:</strong> Change your password after signing in. 
                                  Never share your login details with anyone.
                                </p>
                              </div>
                              
                              <!-- Login Button -->
                              <div class="action-section">
                                <a href="${
                                  process.env.API_BASE_URL ||
                                  'http://localhost:5137'
                                }" class="action-button">
                                  LOGIN NOW
                                </a>
                              </div>
                              
                              <!-- Support -->
                              <p class="support-text">
                                Need help? Contact HR Department during office hours or send a message to earisthrmstesting@gmail.com
                              </p>
                            </div>
                            
                            <!-- Footer -->
                            <div class="email-footer">
                              <p class="footer-text">Human Resources Information System</p>
                              <p class="footer-text">© ${new Date().getFullYear()} Eulogio "Amang" Rodriguez Institute of Science and Technology. All rights reserved.</p>
                            </div>
                            
                          </div>
                        </div>
                      </body>
                      </html>
                    `,
                      });

                      console.log(
                        `Credentials email sent to ${email} for employee ${employeeNumber}`
                      );
                    } catch (emailError) {
                      console.error(
                        'Error sending credentials email:',
                        emailError
                      );
                      // Don't fail registration if email fails
                    }

                    res
                      .status(200)
                      .send({ message: 'User Registered Successfully' });
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send({ error: 'Failed to register user' });
  }
});

// BULK REGISTER WITH EMAIL
router.post('/excel-register', async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'No users data provided' });
  }

  const results = [];
  const errors = [];

  try {
    // Fetch field requirements from system settings
    let fieldRequirements = {
      firstName: true,
      lastName: true,
      email: true,
      employeeNumber: true,
      employmentCategory: true,
      password: true,
      middleName: false,
      nameExtension: false,
    };

    try {
      const settingsQuery = `SELECT setting_value FROM system_settings WHERE setting_key = 'registration_field_requirements'`;
      await new Promise((resolve, reject) => {
        db.query(settingsQuery, (err, rows) => {
          if (err) {
            console.error('Error fetching field requirements:', err);
            return resolve(); // Use defaults
          }
          if (rows.length > 0 && rows[0].setting_value) {
            try {
              fieldRequirements = JSON.parse(rows[0].setting_value);
            } catch (parseErr) {
              console.error('Error parsing field requirements:', parseErr);
            }
          }
          resolve();
        });
      });
    } catch (settingsErr) {
      console.error('Error loading field requirements, using defaults:', settingsErr);
    }

    await Promise.all(
      users.map(
        (user) =>
          new Promise((resolve) => {
            const fullName = [
              user.firstName,
              user.middleName || '',
              user.lastName,
              user.nameExtension || '',
            ]
              .filter(Boolean)
              .join(' ');

            // Validate employmentCategory based on field requirements
            if (fieldRequirements.employmentCategory) {
              // Field is required, validate it
              if (
                user.employmentCategory !== '0' &&
                user.employmentCategory !== '1'
              ) {
                errors.push(
                  `Invalid employmentCategory for ${user.employeeNumber}: Must be '0' (JO) or '1' (Regular)`
                );
                return resolve();
              }
            } else {
              // Field is not required
              // If provided, validate it; otherwise set default
              if (user.employmentCategory === '0' || user.employmentCategory === '1') {
                // Valid value provided, use it
              } else if (user.employmentCategory !== undefined && 
                         user.employmentCategory !== null && 
                         user.employmentCategory !== '') {
                // Invalid value provided
                errors.push(
                  `Invalid employmentCategory for ${user.employeeNumber}: Must be '0' (JO) or '1' (Regular)`
                );
                return resolve();
              } else {
                // Not provided or empty, set default to '1' (Regular)
                user.employmentCategory = '1';
              }
            }

            // Check if employee number already exists
            const queryCheck = `
              SELECT employeeNumber FROM users WHERE employeeNumber = ? 
              UNION 
              SELECT agencyEmployeeNum FROM person_table WHERE agencyEmployeeNum = ?
            `;

            db.query(
              queryCheck,
              [user.employeeNumber, user.employeeNumber],
              (err, existingRecords) => {
                if (err) {
                  errors.push(
                    `Error checking user ${user.employeeNumber}: ${err.message}`
                  );
                  return resolve();
                }

                if (existingRecords.length > 0) {
                  errors.push(
                    `Employee number ${user.employeeNumber} already exists`
                  );
                  return resolve();
                }

                // Insert into users
                const userQuery = `
                  INSERT INTO users (
                    email,
                    role,
                    password,
                    employeeNumber,
                    employmentCategory,
                    access_level,
                    username
                  ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(
                  userQuery,
                  [
                    user.email,
                    'staff',
                    bcrypt.hashSync(user.password, 10),
                    user.employeeNumber,
                    user.employmentCategory,
                    'user',
                    fullName,
                  ],
                  (err) => {
                    if (err) {
                      errors.push(
                        `Error inserting user ${user.employeeNumber}: ${err.message}`
                      );
                      return resolve();
                    }

                    // Insert into person_table
                    const personQuery = `
                      INSERT INTO person_table (
                        firstName,
                        middleName,
                        lastName,
                        nameExtension,
                        agencyEmployeeNum
                      ) VALUES (?, ?, ?, ?, ?)
                    `;

                    db.query(
                      personQuery,
                      [
                        user.firstName,
                        user.middleName || null,
                        user.lastName,
                        user.nameExtension || null,
                        user.employeeNumber,
                      ],
                      (err) => {
                        if (err) {
                          errors.push(
                            `Error inserting person ${user.employeeNumber}: ${err.message}`
                          );
                          // Clean up user record
                          db.query(
                            'DELETE FROM users WHERE employeeNumber = ?',
                            [user.employeeNumber]
                          );
                          return resolve();
                        }

                        // Check if employment_category already exists
                        const checkEmpCatQuery = `
                          SELECT employeeNumber FROM employment_category WHERE employeeNumber = ?
                        `;

                        db.query(
                          checkEmpCatQuery,
                          [user.employeeNumber],
                          (checkErr, existingEmpCat) => {
                            if (checkErr) {
                              errors.push(
                                `Error checking employment category ${user.employeeNumber}: ${checkErr.message}`
                              );
                              // Rollback
                              db.query(
                                'DELETE FROM person_table WHERE agencyEmployeeNum = ?',
                                [user.employeeNumber]
                              );
                              db.query(
                                'DELETE FROM users WHERE employeeNumber = ?',
                                [user.employeeNumber]
                              );
                              return resolve();
                            }

                            // If record exists, update it; otherwise insert
                            let empCatQuery;
                            if (existingEmpCat.length > 0) {
                              // Update existing record
                              empCatQuery = `
                                UPDATE employment_category 
                                SET employmentCategory = ?
                                WHERE employeeNumber = ?
                              `;
                            } else {
                              // Insert new record
                              empCatQuery = `
                                INSERT INTO employment_category (employeeNumber, employmentCategory)
                                VALUES (?, ?)
                              `;
                            }

                            const empCatParams = existingEmpCat.length > 0
                              ? [user.employmentCategory, user.employeeNumber]
                              : [user.employeeNumber, user.employmentCategory];

                            db.query(
                              empCatQuery,
                              empCatParams,
                              async (catErr) => {
                                if (catErr) {
                                  errors.push(
                                    `Error ${existingEmpCat.length > 0 ? 'updating' : 'inserting'} employment category ${user.employeeNumber}: ${catErr.message}`
                                  );
                                  // Rollback
                                  db.query(
                                    'DELETE FROM person_table WHERE agencyEmployeeNum = ?',
                                    [user.employeeNumber]
                                  );
                                  db.query(
                                    'DELETE FROM users WHERE employeeNumber = ?',
                                    [user.employeeNumber]
                                  );
                                  return resolve();
                                }

                                // SEND EMAIL WITH CREDENTIALS
                                try {
                              await transporter.sendMail({
                                from: `"HRIS System" <${process.env.GMAIL_USER}>`,
                                to: user.email,
                                subject:
                                  'Welcome to EARIST - Your Login Information',
                                html: `
                                  <!DOCTYPE html>
                                  <html lang="en">
                                  <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Login Information</title>
                                    <style>
                                      * { margin: 0; padding: 0; box-sizing: border-box; }
                                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; color: #333333; line-height: 1.6; }
                                      .email-wrapper { width: 100%; background-color: #f4f4f4; padding: 30px 15px; }
                                      .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                                      .email-header { background: linear-gradient(135deg, #6d2323 0%, #8a4747 100%); padding: 30px; text-align: center; }
                                      .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; }
                                      .email-body { padding: 35px 30px; }
                                      .greeting { font-size: 15px; color: #333333; margin-bottom: 15px; }
                                      .greeting strong { color: #6d2323; }
                                      .intro-text { font-size: 14px; color: #555555; margin-bottom: 25px; line-height: 1.7; }
                                      .credentials-box { background: #fafafa; border: 2px solid #f5e6e6; border-radius: 6px; padding: 25px; margin: 25px 0; }
                                      .credential-row { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eeeeee; }
                                      .credential-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
                                      .credential-label { font-size: 12px; color: #6d2323; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px; }
                                      .credential-value { font-size: 15px; color: #2c3e50; font-weight: 500; }
                                      .credential-value.highlight { background: #fff8e1; padding: 10px 15px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-size: 16px; letter-spacing: 1px; color: #856404; border: 2px solid #ffc107; display: inline-block; margin-top: 5px; font-weight: 700; }
                                      .credential-value.empnum { font-family: 'Courier New', Courier, monospace; font-size: 16px; color: #6d2323; font-weight: 700; }
                                      .note-box { background: #fff8e1; border-left: 4px solid #6d2323; padding: 15px 20px; margin: 25px 0; border-radius: 4px; }
                                      .note-box p { font-size: 13px; color: #555555; margin: 0; line-height: 1.6; }
                                      .note-box strong { color: #6d2323; }
                                      .action-section { text-align: center; margin: 30px 0 25px; }
                                      .action-button { display: inline-block; background: linear-gradient(135deg, #6d2323 0%, #8a4747 100%); color: #ffffff !important; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(109, 35, 35, 0.25); transition: all 0.3s ease; }
                                      .action-button:hover { background: linear-gradient(135deg, #5a1e1e 0%, #6d2323 100%); transform: translateY(-2px); }
                                      .support-text { font-size: 13px; color: #777777; text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eeeeee; }
                                      .email-footer { background: linear-gradient(135deg, #6d2323 0%, #8a4747 100%); padding: 25px; text-align: center; }
                                      .footer-text { font-size: 12px; color: #f5e6e6; margin: 5px 0; }
                                      @media only screen and (max-width: 600px) { .email-wrapper { padding: 20px 10px; } .email-body { padding: 25px 20px; } .email-header h1 { font-size: 22px; } .credentials-box { padding: 20px; } }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="email-wrapper">
                                      <div class="email-container">
                                        <div class="email-header">
                                          <h1>Welcome!</h1>
                                        </div>
                                        <div class="email-body">
                                          <p class="greeting">Hello <strong>${fullName}</strong>,</p>
                                          <p class="intro-text">
                                            Your employee account has been created. You can now access your payslip, 
                                            check attendance, and manage your personal information online.
                                          </p>
                                          <div class="credentials-box">
                                            <div class="credential-row">
                                              <div class="credential-label">Employee Number</div>
                                              <div class="credential-value empnum">${
                                                user.employeeNumber
                                              }</div>
                                            </div>
                                            <div class="credential-row">
                                              <div class="credential-label">Email</div>
                                              <div class="credential-value">${
                                                user.email
                                              }</div>
                                            </div>
                                            <div class="credential-row">
                                              <div class="credential-label">Temporary Password</div>
                                              <div class="credential-value">
                                                <span class="highlight">${
                                                  user.password
                                                }</span>
                                              </div>
                                            </div>
                                            <div class="credential-row">
                                              <div class="credential-label">Employment Type</div>
                                              <div class="credential-value">${
                                                user.employmentCategory === '1'
                                                  ? 'Regular'
                                                  : 'Job Order'
                                              }</div>
                                            </div>
                                          </div>
                                          <div class="note-box">
                                            <p>
                                              <strong>Important:</strong> Change your password after signing in. 
                                              Never share your login details with anyone.
                                            </p>
                                          </div>
                                          <div class="action-section">
                                            <a href="${
                                              process.env.API_BASE_URL ||
                                              'http://localhost:5137'
                                            }" class="action-button" style="color: #ffffff !important; text-decoration: none;">
                                              LOGIN NOW
                                            </a>
                                          </div>
                                          <p class="support-text">
                                            Need help? Contact HR Department during office hours or send a message to earisthrmstesting@gmail.com
                                          </p>
                                        </div>
                                        <div class="email-footer">
                                          <p class="footer-text">Human Resources Information System</p>
                                          <p class="footer-text">© ${new Date().getFullYear()} Eulogio "Amang" Rodriguez Institute of Science and Technology. All rights reserved.</p>
                                        </div>
                                      </div>
                                    </div>
                                  </body>
                                  </html>
                                `,
                              });

                              console.log(
                                `Credentials email sent to ${user.email} for employee ${user.employeeNumber}`
                              );
                            } catch (emailError) {
                              console.error(
                                `Error sending email to ${user.email}:`,
                                emailError
                              );
                              // Don't fail registration if email fails, just log it
                            }

                                results.push({
                                  employeeNumber: user.employeeNumber,
                                  name: fullName,
                                  status: 'success',
                                });
                                resolve();
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          })
      )
    );

    res.json({
      message: 'Bulk registration completed',
      successful: results,
      errors: errors,
    });
  } catch (error) {
    console.error('Error during bulk registration:', error);
    res.status(500).json({ error: 'Failed to process bulk registration' });
  }
});

// GET ALL REGISTERED USERS WITH PAGE ACCESS
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.employeeNumber,
        u.email,
        u.role,
        u.employmentCategory,
        u.access_level,
        p.firstName,
        p.middleName,
        p.lastName,
        p.nameExtension,
        u.created_at,
        pa.page_id,
        pa.page_privilege
      FROM users u
      LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum
      LEFT JOIN page_access pa ON u.employeeNumber = pa.employeeNumber
      ORDER BY u.created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        console.error('SQL Error details:', err.message);
        console.error('SQL Error code:', err.code);
        console.error('SQL Error sqlMessage:', err.sqlMessage);
        return res.status(500).json({ 
          error: 'Failed to fetch users',
          details: err.message || err.sqlMessage || 'Database query error'
        });
      }

      // Group page access per user
      const usersMap = {};
      results.forEach((row) => {
        if (!usersMap[row.employeeNumber]) {
          usersMap[row.employeeNumber] = {
            employeeNumber: row.employeeNumber,
            fullName: `${row.firstName || ''} ${
              row.middleName ? row.middleName + ' ' : ''
            }${row.lastName || ''}${
              row.nameExtension ? ' ' + row.nameExtension : ''
            }`.trim(),
            firstName: row.firstName,
            middleName: row.middleName,
            lastName: row.lastName,
            nameExtension: row.nameExtension,
            email: row.email,
            role: row.role,
            employmentCategory: row.employmentCategory,
            accessLevel: row.access_level,
            createdAt: row.created_at,
            pageAccess: [],
          };
        }

        if (row.page_id) {
          usersMap[row.employeeNumber].pageAccess.push({
            page_id: row.page_id,
            page_privilege: row.page_privilege,
          });
        }
      });

      res.status(200).json(Object.values(usersMap));
    });
  } catch (err) {
    console.error('Error during user fetch:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: err.message || 'Unknown error occurred'
    });
  }
});

// GET: Search users for password reset (with filtering)
// NOTE: This route must come BEFORE /users/:employeeNumber to avoid route conflicts
router.get('/users/search', authenticateToken, (req, res) => {
  const { q } = req.query; // Search query parameter

  try {
    let query = `
      SELECT 
        u.employeeNumber,
        u.email,
        u.role,
        p.firstName,
        p.middleName,
        p.lastName,
        p.nameExtension,
        CONCAT_WS(' ', p.firstName, p.middleName, p.lastName, p.nameExtension) as fullName
      FROM users u
      LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum
      WHERE 1=1
    `;

    let queryParams = [];

    // If search query is provided, filter by name, email, or employee number
    if (q && q.trim() !== '') {
      query += ` AND (
        CONCAT_WS(' ', p.firstName, p.middleName, p.lastName, p.nameExtension) LIKE ?
        OR p.firstName LIKE ?
        OR p.lastName LIKE ?
        OR u.employeeNumber LIKE ?
        OR u.email LIKE ?
      )`;
      const searchTerm = `%${q.trim()}%`;
      queryParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
    }

    query += ` ORDER BY p.lastName, p.firstName ASC LIMIT 100`;

    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error searching users:', err);
        return res.status(500).json({ error: 'Failed to search users' });
      }

      // Log audit
      try {
        logAudit(req.user, 'Search', 'users', null, null);
      } catch (e) {
        console.error('Audit log error:', e);
      }

      res.status(200).json(results);
    });
  } catch (err) {
    console.error('Error during user search:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// GET SINGLE USER WITH PAGE ACCESS
router.get('/users/:employeeNumber', authenticateToken, async (req, res) => {
  const { employeeNumber } = req.params;

  try {
    const query = `
      SELECT 
        u.employeeNumber,
        u.email,
        u.role,
        u.employmentCategory,
        u.access_level,
        p.firstName,
        p.middleName,
        p.lastName,
        p.nameExtension,
        u.created_at,
        pa.page_id,
        pa.page_privilege
      FROM users u
      LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum
      LEFT JOIN page_access pa ON u.employeeNumber = pa.employeeNumber
      WHERE u.employeeNumber = ?
    `;

    db.query(query, [employeeNumber], (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const base = results[0];
      const user = {
        employeeNumber: base.employeeNumber,
        fullName: `${base.firstName || ''} ${
          base.middleName ? base.middleName + ' ' : ''
        }${base.lastName || ''}${
          base.nameExtension ? ' ' + base.nameExtension : ''
        }`.trim(),
        firstName: base.firstName,
        middleName: base.middleName,
        lastName: base.lastName,
        nameExtension: base.nameExtension,
        email: base.email,
        role: base.role,
        employmentCategory: base.employmentCategory,
        accessLevel: base.access_level,
        createdAt: base.created_at,
        pageAccess: results
          .filter((r) => r.page_id)
          .map((r) => ({
            page_id: r.page_id,
            page_privilege: r.page_privilege,
          })),
      };

      res.status(200).json({
        message: 'User fetched successfully',
        user,
      });
    });
  } catch (err) {
    console.error('Error during user fetch:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT: Update user role
router.put('/users/:employeeNumber/role', authenticateToken, (req, res) => {
  const { employeeNumber } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const validRoles = ['superadmin', 'administrator', 'staff'];
  if (!validRoles.includes(role.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid role. Must be one of: superadmin, administrator, staff' });
  }

  // First, get the current role for audit logging
  const getCurrentRoleQuery = 'SELECT role FROM users WHERE employeeNumber = ?';
  db.query(getCurrentRoleQuery, [employeeNumber], (err, results) => {
    if (err) {
      console.error('Error fetching current role:', err);
      return res.status(500).json({ error: 'Failed to fetch current role' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentRole = results[0].role;
    const newRole = role.toLowerCase();

    // If role hasn't changed, return early
    if (currentRole === newRole) {
      return res.status(200).json({ message: 'Role unchanged', role: newRole });
    }

    // Update the role
    const updateQuery = 'UPDATE users SET role = ? WHERE employeeNumber = ?';
    db.query(updateQuery, [newRole, employeeNumber], (err, result) => {
      if (err) {
        console.error('Error updating user role:', err);
        return res.status(500).json({ error: 'Failed to update user role' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log audit
      try {
        logAudit(
          req.user,
          'Update',
          'users',
          employeeNumber,
          employeeNumber
        );
      } catch (e) {
        console.error('Audit log error:', e);
      }

      res.status(200).json({
        message: 'User role updated successfully',
        employeeNumber,
        previousRole: currentRole,
        newRole: newRole,
      });
    });
  });
});

// POST: Reset password to surname and send email notification
router.post('/users/reset-password', authenticateToken, async (req, res) => {
  const { employeeNumber } = req.body;

  if (!employeeNumber) {
    return res.status(400).json({ error: 'Employee number is required' });
  }

  try {
    // First, get user info and surname
    const userQuery = `
      SELECT 
        u.employeeNumber,
        u.email,
        u.username,
        p.firstName,
        p.middleName,
        p.lastName,
        p.nameExtension,
        CONCAT_WS(' ', p.firstName, p.middleName, p.lastName, p.nameExtension) as fullName
      FROM users u
      LEFT JOIN person_table p ON u.employeeNumber = p.agencyEmployeeNum
      WHERE u.employeeNumber = ?
    `;

    db.query(userQuery, [employeeNumber], async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = results[0];
      const surname = user.lastName;

      if (!surname) {
        return res.status(400).json({ error: 'User does not have a surname (lastName) in the system' });
      }

      if (!user.email) {
        return res.status(400).json({ error: 'User does not have an email address' });
      }

      // Convert surname to ALL CAPS and remove ALL spaces for the password
      const surnameUpperCase = surname.toUpperCase().replace(/\s+/g, '');

      // Hash the surname (in uppercase with no spaces) as the new password
      const hashedPassword = await bcrypt.hash(surnameUpperCase, 10);

      // Update password in database
      const updateQuery = 'UPDATE users SET password = ? WHERE employeeNumber = ?';
      db.query(updateQuery, [hashedPassword, employeeNumber], async (updateErr) => {
        if (updateErr) {
          console.error('Error updating password:', updateErr);
          return res.status(500).json({ error: 'Failed to update password' });
        }

        // Send email notification
        try {
          const mailOptions = {
            from: `"HRIS System" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Notification - HRIS System',
            html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Notification</title>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; color: #333333; line-height: 1.6; }
                  .email-wrapper { width: 100%; background-color: #f4f4f4; padding: 30px 15px; }
                  .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
                  .email-header { background: linear-gradient(135deg, #A31D1D 0%, #8a4747 100%); padding: 30px; text-align: center; }
                  .email-header h1 { color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; }
                  .email-body { padding: 35px 30px; }
                  .greeting { font-size: 15px; color: #333333; margin-bottom: 15px; }
                  .greeting strong { color: #A31D1D; }
                  .intro-text { font-size: 14px; color: #555555; margin-bottom: 25px; line-height: 1.7; }
                  .credentials-box { background: #fafafa; border: 2px solid #f5e6e6; border-radius: 6px; padding: 25px; margin: 25px 0; }
                  .credential-row { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eeeeee; }
                  .credential-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
                  .credential-label { font-size: 12px; color: #A31D1D; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px; }
                  .credential-value { font-size: 15px; color: #2c3e50; font-weight: 500; }
                  .credential-value.highlight { background: #fff8e1; padding: 10px 15px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-size: 16px; letter-spacing: 1px; color: #856404; border: 2px solid #ffc107; display: inline-block; margin-top: 5px; font-weight: 700; }
                  .credential-value.empnum { font-family: 'Courier New', Courier, monospace; font-size: 16px; color: #A31D1D; font-weight: 700; }
                  .note-box { background: #fff8e1; border-left: 4px solid #A31D1D; padding: 15px 20px; margin: 25px 0; border-radius: 4px; }
                  .note-box p { font-size: 13px; color: #555555; margin: 0; line-height: 1.6; }
                  .note-box strong { color: #A31D1D; }
                  .action-section { text-align: center; margin: 30px 0 25px; }
                  .action-button { display: inline-block; background: linear-gradient(135deg, #A31D1D 0%, #8a4747 100%); color: #ffffff !important; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(163, 29, 29, 0.25); transition: all 0.3s ease; }
                  .action-button:hover { background: linear-gradient(135deg, #8a1a1a 0%, #6d2323 100%); transform: translateY(-2px); }
                  .support-text { font-size: 13px; color: #777777; text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eeeeee; }
                  .email-footer { background: linear-gradient(135deg, #A31D1D 0%, #8a4747 100%); padding: 25px; text-align: center; }
                  .footer-text { font-size: 12px; color: #f5e6e6; margin: 5px 0; }
                  @media only screen and (max-width: 600px) { .email-wrapper { padding: 20px 10px; } .email-body { padding: 25px 20px; } .email-header h1 { font-size: 22px; } .credentials-box { padding: 20px; } }
                </style>
              </head>
              <body>
                <div class="email-wrapper">
                  <div class="email-container">
                    <div class="email-header">
                      <h1>Password Reset Notification</h1>
                    </div>
                    <div class="email-body">
                      <p class="greeting">Hello <strong>${user.fullName || user.username}</strong>,</p>
                      <p class="intro-text">
                        Your password has been reset by an administrator. Your account password has been set to your surname (last name) in ALL CAPS with no spaces.
                      </p>
                      <div class="credentials-box">
                        <div class="credential-row">
                          <div class="credential-label">Employee Number</div>
                          <div class="credential-value empnum">${user.employeeNumber}</div>
                        </div>
                        <div class="credential-row">
                          <div class="credential-label">New Password</div>
                          <div class="credential-value highlight">${surnameUpperCase}</div>
                        </div>
                      </div>
                      <div class="note-box">
                        <p>
                          <strong>Important:</strong> For security reasons, please change your password after logging in. 
                          This is a temporary password set to your surname in ALL CAPS with no spaces.
                        </p>
                      </div>
                      <div class="action-section">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5137'}" class="action-button">Login to HRIS</a>
                      </div>
                      <p class="support-text">
                        If you did not request this password reset, please contact your system administrator immediately.
                      </p>
                    </div>
                    <div class="email-footer">
                      <p class="footer-text">This is an automated message from the HRIS System.</p>
                      <p class="footer-text">Please do not reply to this email.</p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          };

          await transporter.sendMail(mailOptions);

          // Log audit
          try {
            logAudit(
              req.user,
              'Update',
              'users',
              employeeNumber,
              employeeNumber
            );
          } catch (e) {
            console.error('Audit log error:', e);
          }

          res.status(200).json({
            message: 'Password reset successfully and email notification sent',
            employeeNumber: user.employeeNumber,
            email: user.email,
          });
        } catch (emailErr) {
          console.error('Error sending email:', emailErr);
          // Password was updated but email failed - still return success but with warning
          res.status(200).json({
            message: 'Password reset successfully but email notification failed',
            employeeNumber: user.employeeNumber,
            warning: 'Email could not be sent. Please notify the user manually.',
          });
        }
      });
    });
  } catch (err) {
    console.error('Error during password reset:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;