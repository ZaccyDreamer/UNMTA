const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'database.db');
const ADMIN_PASSWORD = 'unmta_admin_pass'; // Plain text for simplicity, configurable in frontend

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database.');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Create members table
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        reg_no TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        course TEXT NOT NULL,
        year_of_study TEXT NOT NULL,
        phone TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'Pending',
        amount_paid REAL DEFAULT 0,
        date_joined TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active' -- 'Active', 'Discontinued'
      )
    `);

    // Check if table is empty, and seed with some data if so
    db.get("SELECT COUNT(*) as count FROM members", (err, row) => {
      if (err) {
        console.error('Error checking database count:', err);
        return;
      }
      if (row.count === 0) {
        console.log('Seeding initial members/alumni database...');
        const initialMembers = [
          {
            name: "Zacchaeus Mutua",
            reg_no: "I39/8492/2022",
            email: "zmutua@student.uonbi.ac.ke",
            course: "Bachelor of Science in Microprocessor Technology and Instrumentation",
            year_of_study: "4th Year",
            phone: "0712345678",
            payment_status: "Paid",
            amount_paid: 300, // Reg (200) + Renewal (100)
            date_joined: "2022-10-15",
            status: "Active"
          },
          {
            name: "Dr. Evans Omondi",
            reg_no: "I39/1002/2015",
            email: "eomondi@alumni.uonbi.ac.ke",
            course: "Bachelor of Science in Microprocessor Technology and Instrumentation",
            year_of_study: "Alumni",
            phone: "0722334455",
            payment_status: "Paid",
            amount_paid: 200,
            date_joined: "2015-09-08",
            status: "Active"
          },
          {
            name: "Mercy Chelagat",
            reg_no: "I44/3204/2024",
            email: "mchelagat@student.uonbi.ac.ke",
            course: "Bachelor of Science in Astronomy and Astrophysics",
            year_of_study: "2nd Year",
            phone: "0799887766",
            payment_status: "Paid",
            amount_paid: 200,
            date_joined: "2024-09-12",
            status: "Active"
          },
          {
            name: "Newton Kiprotich",
            reg_no: "I39/5501/2023",
            email: "nkiprotich@student.uonbi.ac.ke",
            course: "Bachelor of Science in Microprocessor Technology and Instrumentation",
            year_of_study: "3rd Year",
            phone: "0755443322",
            payment_status: "Paid",
            amount_paid: 200,
            date_joined: "2023-10-01",
            status: "Discontinued"
          },
          {
            name: "Grace Kendi",
            reg_no: "I44/1102/2025",
            email: "gkendi@student.uonbi.ac.ke",
            course: "Bachelor of Science in Astronomy and Astrophysics",
            year_of_study: "1st Year",
            phone: "0700112233",
            payment_status: "Pending",
            amount_paid: 0,
            date_joined: "2025-11-20",
            status: "Active"
          }
        ];

        const stmt = db.prepare(`
          INSERT INTO members (name, reg_no, email, course, year_of_study, phone, payment_status, amount_paid, date_joined, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        initialMembers.forEach((member) => {
          stmt.run(
            member.name,
            member.reg_no,
            member.email,
            member.course,
            member.year_of_study,
            member.phone,
            member.payment_status,
            member.amount_paid,
            member.date_joined,
            member.status
          );
        });
        stmt.finalize();
        console.log('Database seeding complete.');
      }
    });
  });
}

// APIs

// 1. Admin Authentication Check
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Authentication successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Password' });
  }
});

// 2. Get all members (Admin only)
app.post('/api/admin/members', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  db.all("SELECT * FROM members ORDER BY date_joined DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
    res.json({ success: true, members: rows });
  });
});

// 3. Initiate Registration (simulates starting the M-Pesa push flow)
app.post('/api/members/register', (req, res) => {
  const { name, reg_no, email, course, year_of_study, phone } = req.body;

  if (!name || !reg_no || !email || !course || !year_of_study || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Check if email or reg_no already exists
  db.get("SELECT id FROM members WHERE email = ? OR reg_no = ?", [email, reg_no], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
    if (row) {
      return res.status(400).json({ success: false, message: 'A member with this Registration Number or Email already exists.' });
    }

    // Insert as Pending first
    const dateJoined = new Date().toISOString().split('T')[0];
    const stmt = db.prepare(`
      INSERT INTO members (name, reg_no, email, course, year_of_study, phone, payment_status, amount_paid, date_joined, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', 0, ?, 'Active')
    `);

    stmt.run(name, reg_no, email, course, year_of_study, phone, dateJoined, function(err2) {
      if (err2) {
        return res.status(500).json({ success: false, message: 'Failed to create member record', error: err2.message });
      }

      const memberId = this.lastID;
      // Return details to trigger the client-side simulator
      res.json({
        success: true,
        message: 'Registration initialized. Please simulate the M-Pesa payment.',
        memberId: memberId,
        amount: 200,
        phone: phone
      });
    });
    stmt.finalize();
  });
});

// 4. Confirm Payment (simulates M-Pesa STK confirmation callback)
app.post('/api/members/confirm-payment', (req, res) => {
  const { memberId, amount, transactionCode } = req.body;

  if (!memberId || !amount || !transactionCode) {
    return res.status(400).json({ success: false, message: 'Missing parameters.' });
  }

  db.run(
    "UPDATE members SET payment_status = 'Paid', amount_paid = ? WHERE id = ?",
    [amount, memberId],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to update payment status', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Member not found.' });
      }
      res.json({ success: true, message: 'Payment confirmed successfully!', transactionCode });
    }
  );
});

// 5. Admin Add Member Directly (Manual addition)
app.post('/api/admin/members/add', (req, res) => {
  const { password, name, reg_no, email, course, year_of_study, phone, payment_status } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!name || !reg_no || !email || !course || !year_of_study || !phone) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Check if exists
  db.get("SELECT id FROM members WHERE email = ? OR reg_no = ?", [email, reg_no], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    if (row) {
      return res.status(400).json({ success: false, message: 'Member with this Reg No or Email already exists.' });
    }

    const dateJoined = new Date().toISOString().split('T')[0];
    const amountPaid = payment_status === 'Paid' ? 200 : 0;
    const stmt = db.prepare(`
      INSERT INTO members (name, reg_no, email, course, year_of_study, phone, payment_status, amount_paid, date_joined, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `);

    stmt.run(name, reg_no, email, course, year_of_study, phone, payment_status || 'Pending', amountPaid, dateJoined, function(err2) {
      if (err2) {
        return res.status(500).json({ success: false, message: 'Database insertion error.' });
      }
      res.json({ success: true, message: 'Member added successfully by admin.' });
    });
    stmt.finalize();
  });
});

// 6. Admin Update Status (Active / Discontinued)
app.post('/api/admin/members/status', (req, res) => {
  const { password, memberId, status } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!memberId || !status) {
    return res.status(400).json({ success: false, message: 'Missing parameters.' });
  }

  db.run(
    "UPDATE members SET status = ? WHERE id = ?",
    [status, memberId],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database update failed.' });
      }
      res.json({ success: true, message: `Member status updated to ${status}.` });
    }
  );
});

// 7. Admin Delete Member
app.post('/api/admin/members/delete', (req, res) => {
  const { password, memberId } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!memberId) {
    return res.status(400).json({ success: false, message: 'Missing member ID.' });
  }

  db.run(
    "DELETE FROM members WHERE id = ?",
    [memberId],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database deletion failed.' });
      }
      res.json({ success: true, message: 'Member deleted successfully.' });
    }
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`UNMTA server running on port ${PORT}`);
});
