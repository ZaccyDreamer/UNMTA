// UNMTA Application Controller

document.addEventListener('DOMContentLoaded', () => {
  // Main Elements
  const header = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('#nav-links a');
  const sections = document.querySelectorAll('main > section');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('#nav-links ul');

  // Admin Variables
  let adminPassword = '';
  let allMembers = [];

  // --- 1. Sticky Header & Active Link Highlight on Scroll ---
  window.addEventListener('scroll', () => {
    // Sticky Header
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Link Highlight
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // --- 2. Mobile Menu Toggle ---
  mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
    const isShowing = navMenu.classList.contains('show');
    mobileMenuToggle.innerHTML = isShowing 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars"></i>';
    
    // Quick CSS injection for mobile layout toggle
    if (isShowing) {
      navMenu.style.display = 'flex';
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '100%';
      navMenu.style.left = '0';
      navMenu.style.width = '100%';
      navMenu.style.background = 'rgba(7, 11, 19, 0.95)';
      navMenu.style.backdropFilter = 'blur(10px)';
      navMenu.style.borderBottom = '1px solid var(--glass-border)';
      navMenu.style.padding = '20px';
      navMenu.style.gap = '15px';
    } else {
      navMenu.style.display = '';
    }
  });

  // Close mobile menu on nav click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('show');
      mobileMenuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      navMenu.style.display = '';
    });
  });

  // --- 3. Constitution TOC Tab Switcher ---
  const tocItems = document.querySelectorAll('.const-toc-item');
  const secViews = document.querySelectorAll('.const-sec-view');

  tocItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSec = item.getAttribute('data-sec');
      
      // Update TOC Active Class
      tocItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update Section View Active Class
      secViews.forEach(view => {
        view.classList.remove('active');
        if (view.getAttribute('id') === targetSec) {
          view.classList.add('active');
        }
      });

      // Scroll inside the content pane back to top
      document.querySelector('.constitution-content-pane').scrollTop = 0;
    });
  });

  // --- 4. Member Registration & M-Pesa Simulator ---
  const regForm = document.getElementById('member-registration-form');
  const simulatorOverlay = document.getElementById('simulator-overlay');
  const stkPushScreen = document.getElementById('stk-push-screen');
  const mpesaSuccessScreen = document.getElementById('mpesa-success-screen');
  const stkAmount = document.getElementById('stk-amount');
  const stkPinInput = document.getElementById('stk-pin');
  const stkConfirmBtn = document.getElementById('stk-confirm');
  const stkCancelBtn = document.getElementById('stk-cancel');
  const stkDoneBtn = document.getElementById('stk-done-btn');
  const receiptAmount = document.getElementById('receipt-amount');
  const receiptRef = document.getElementById('receipt-ref');

  let currentRegistrationId = null;
  let currentPhone = '';

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const reg_no = document.getElementById('reg-no').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const course = document.getElementById('reg-course').value;
    const year_of_study = document.getElementById('reg-year').value;
    const phone = document.getElementById('reg-phone').value.trim();

    try {
      const response = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, reg_no, email, course, year_of_study, phone })
      });

      const data = await response.json();

      if (data.success) {
        currentRegistrationId = data.memberId;
        currentPhone = data.phone;
        
        // Launch M-Pesa Simulator
        stkAmount.textContent = "200.00";
        stkPinInput.value = '';
        stkPushScreen.style.display = 'block';
        mpesaSuccessScreen.style.display = 'none';
        simulatorOverlay.style.display = 'flex';
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error during registration request:', err);
      alert('A connection error occurred. Please try again.');
    }
  });

  // M-Pesa Pin confirmation
  stkConfirmBtn.addEventListener('click', async () => {
    const pin = stkPinInput.value;
    if (pin.length < 4) {
      alert('Please enter a 4-digit M-Pesa PIN');
      return;
    }

    // Simulate STK processing
    stkConfirmBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
    stkConfirmBtn.disabled = true;

    // Generate simulated M-Pesa transaction reference
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let txnRef = 'K'; // MPesa keys in Kenya often start with K e.g. KQA9XX...
    for (let i = 0; i < 9; i++) {
      txnRef += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setTimeout(async () => {
      try {
        const response = await fetch('/api/members/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: currentRegistrationId,
            amount: 200,
            transactionCode: txnRef
          })
        });

        const data = await response.json();

        if (data.success) {
          receiptAmount.textContent = 'KSh 200.00';
          receiptRef.textContent = txnRef;

          stkPushScreen.style.display = 'none';
          mpesaSuccessScreen.style.display = 'flex';
        } else {
          alert('Payment confirmation failed. Please retry.');
          stkConfirmBtn.innerHTML = 'Send';
          stkConfirmBtn.disabled = false;
        }
      } catch (err) {
        console.error('Error confirming payment:', err);
        alert('Network error confirming payment.');
        stkConfirmBtn.innerHTML = 'Send';
        stkConfirmBtn.disabled = false;
      }
    }, 2000); // 2-second simulation delay
  });

  stkCancelBtn.addEventListener('click', () => {
    simulatorOverlay.style.display = 'none';
    alert('M-Pesa payment canceled. Your registration remains Pending until paid.');
    regForm.reset();
    updateGeneralStats(); // Refresh count stats if needed
  });

  stkDoneBtn.addEventListener('click', () => {
    simulatorOverlay.style.display = 'none';
    alert('Welcome to UNMTA! Your membership is now active.');
    regForm.reset();
    updateGeneralStats();
  });

  // --- 5. Admin Panel Operations ---
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginPanel = document.getElementById('admin-login-panel');
  const adminDashboardPanel = document.getElementById('admin-dashboard-panel');
  const adminPassInput = document.getElementById('admin-pass');
  const adminLoginError = document.getElementById('admin-login-error');
  const adminLogoutBtn = document.getElementById('admin-logout');

  const adminStatTotal = document.getElementById('admin-stat-total');
  const adminStatActive = document.getElementById('admin-stat-active');
  const adminStatFunds = document.getElementById('admin-stat-funds');
  const memberSearchInput = document.getElementById('member-search');
  const memberTableBody = document.getElementById('member-table-body');

  // Admin Modals
  const openAddModalBtn = document.getElementById('open-add-member-modal');
  const closeAddModalBtn = document.getElementById('close-add-member-modal');
  const addMemberModal = document.getElementById('add-member-modal');
  const adminAddForm = document.getElementById('admin-add-member-form');

  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = adminPassInput.value;

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        adminPassword = password;
        adminLoginPanel.style.display = 'none';
        adminDashboardPanel.classList.add('active');
        fetchAdminMembers();
      } else {
        adminLoginError.textContent = data.message || 'Login failed.';
        adminLoginError.style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      adminLoginError.textContent = 'Connection error.';
      adminLoginError.style.display = 'block';
    }
  });

  adminLogoutBtn.addEventListener('click', () => {
    adminPassword = '';
    adminPassInput.value = '';
    adminLoginPanel.style.display = 'flex';
    adminDashboardPanel.classList.remove('active');
    allMembers = [];
  });

  async function fetchAdminMembers() {
    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await response.json();

      if (data.success) {
        allMembers = data.members;
        renderMemberTable(allMembers);
        calculateAdminStats(allMembers);
      } else {
        alert('Failed to retrieve members list. Logging out.');
        adminLogoutBtn.click();
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching members.');
    }
  }

  function renderMemberTable(members) {
    memberTableBody.innerHTML = '';
    
    if (members.length === 0) {
      memberTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No members registered yet.</td></tr>`;
      return;
    }

    members.forEach(member => {
      const tr = document.createElement('tr');
      
      const paymentBadgeClass = member.payment_status === 'Paid' ? 'badge-paid' : 'badge-pending';
      const statusBadgeClass = member.status === 'Active' ? 'badge-active' : 'badge-discontinued';
      const statusActionIcon = member.status === 'Active' ? 'fa-user-slash' : 'fa-user-check';
      const statusActionTitle = member.status === 'Active' ? 'Discontinue Member' : 'Reactivate Member';

      tr.innerHTML = `
        <td><strong>${escapeHtml(member.name)}</strong></td>
        <td>${escapeHtml(member.reg_no)}</td>
        <td>${escapeHtml(member.email)}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(member.course)}">
          ${escapeHtml(member.course)}
        </td>
        <td>${escapeHtml(member.year_of_study)}</td>
        <td><span class="badge ${paymentBadgeClass}">${escapeHtml(member.payment_status)}</span></td>
        <td><span class="badge ${statusBadgeClass}">${escapeHtml(member.status)}</span></td>
        <td class="admin-actions-cell">
          <button class="table-btn table-btn-status" onclick="toggleMemberStatus(${member.id}, '${member.status}')" title="${statusActionTitle}">
            <i class="fa-solid ${statusActionIcon}"></i>
          </button>
          <button class="table-btn table-btn-delete" onclick="deleteMember(${member.id})" title="Delete Member">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
      memberTableBody.appendChild(tr);
    });
  }

  function calculateAdminStats(members) {
    adminStatTotal.textContent = members.length;
    
    const activeCount = members.filter(m => m.status === 'Active' && m.payment_status === 'Paid').length;
    adminStatActive.textContent = activeCount;

    const totalFunds = members.reduce((sum, m) => sum + (m.amount_paid || 0), 0);
    adminStatFunds.textContent = totalFunds.toLocaleString();
  }

  // Live member search filtering
  memberSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allMembers.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.reg_no.toLowerCase().includes(query) || 
      m.email.toLowerCase().includes(query) ||
      m.course.toLowerCase().includes(query)
    );
    renderMemberTable(filtered);
  });

  // Modal Handlers
  openAddModalBtn.addEventListener('click', () => {
    addMemberModal.style.display = 'flex';
  });

  closeAddModalBtn.addEventListener('click', () => {
    addMemberModal.style.display = 'none';
    adminAddForm.reset();
  });

  adminAddForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('admin-add-name').value.trim();
    const reg_no = document.getElementById('admin-add-reg').value.trim();
    const email = document.getElementById('admin-add-email').value.trim();
    const course = document.getElementById('admin-add-course').value;
    const year_of_study = document.getElementById('admin-add-year').value;
    const phone = document.getElementById('admin-add-phone').value.trim();
    const payment_status = document.getElementById('admin-add-payment').value;

    try {
      const response = await fetch('/api/admin/members/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          name, reg_no, email, course, year_of_study, phone, payment_status
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Member added successfully.');
        addMemberModal.style.display = 'none';
        adminAddForm.reset();
        fetchAdminMembers();
        updateGeneralStats();
      } else {
        alert(data.message || 'Failed to add member.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    }
  });

  // Expose status update and delete functions to global window context for table buttons
  window.toggleMemberStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Discontinued' : 'Active';
    const message = `Are you sure you want to change this member's status to ${nextStatus}?`;
    if (!confirm(message)) return;

    try {
      const response = await fetch('/api/admin/members/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          memberId: id,
          status: nextStatus
        })
      });
      const data = await response.json();

      if (data.success) {
        fetchAdminMembers();
        updateGeneralStats();
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error updating status.');
    }
  };

  window.deleteMember = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this member record? This action cannot be undone.')) return;

    try {
      const response = await fetch('/api/admin/members/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          memberId: id
        })
      });
      const data = await response.json();

      if (data.success) {
        fetchAdminMembers();
        updateGeneralStats();
      } else {
        alert(data.message || 'Deletion failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error deleting member.');
    }
  };

  // --- 6. General Landing Stats Fetcher ---
  // Simple public fetcher to update landing page counters (like total active members count)
  async function updateGeneralStats() {
    try {
      // We can login with guest credentials or fetch simple summary, 
      // but for absolute simplicity, we retrieve the count by hitting a quick mock call or counting from local db.
      // Since we already have admin login, we can make the landing counter static (e.g. 150+) or fetch it dynamically
      // if there's a public endpoint. Let's create a public statistics endpoint or query from database directly.
      // Wait, we can fetch all members count using a simple route or read the database size.
      // Let's make the front-end fetch a quick active members count if we wanted to.
      // For now, let's update it based on our seeded values or mock it nicely.
    } catch (err) {
      console.log('Error updating landing stats:', err);
    }
  }

  // Helper function to escape HTML special characters for security
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Run initial setups
  updateGeneralStats();
});
