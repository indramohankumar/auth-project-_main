const http = require('http');

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('Starting API Tests against:', baseUrl);
  
  let userToken = '';
  let adminToken = '';
  let userId = '';
  let adminId = '';
  let visitorId = '';
  let appointmentId = '';

  const randStr = Math.random().toString(36).substring(7);
  
  // 1. Register User (Role: employee)
  try {
    console.log('\n--- Test: Register Employee ---');
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Employee ${randStr}`,
        email: `employee${randStr}@test.com`,
        password: 'password123',
        role: 'employee'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
  } catch (err) { console.error('Error:', err); }

  // 2. Register Admin (Role: admin)
  try {
    console.log('\n--- Test: Register Admin ---');
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Admin ${randStr}`,
        email: `admin${randStr}@test.com`,
        password: 'password123',
        role: 'admin'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
  } catch (err) { console.error('Error:', err); }

  // 3. Login Employee
  try {
    console.log('\n--- Test: Login Employee ---');
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `employee${randStr}@test.com`,
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
    if(data.token) {
        userToken = data.token;
        userId = data.user._id;
    }
  } catch (err) { console.error('Error:', err); }

  // 4. Login Admin
  try {
    console.log('\n--- Test: Login Admin ---');
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `admin${randStr}@test.com`,
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
    if(data.token) {
        adminToken = data.token;
        adminId = data.user._id;
    }
  } catch (err) { console.error('Error:', err); }

  // 5. Test Protected Route with Employee Token
  try {
    console.log('\n--- Test: Protected Route ---');
    const res = await fetch(`${baseUrl}/protected`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
  } catch (err) { console.error('Error:', err); }

  // 6. Test Admin Route with Admin Token
  try {
    console.log('\n--- Test: Admin Route ---');
    const res = await fetch(`${baseUrl}/admin`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
  } catch (err) { console.error('Error:', err); }

  // 7. Create Visitor
  try {
    console.log('\n--- Test: Create Visitor ---');
    const res = await fetch(`${baseUrl}/visitor`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        name: `Visitor ${randStr}`,
        email: `visitor${randStr}@test.com`,
        phone: '1234567890',
        address: '123 Test St',
        purpose: 'Meeting'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
    if(data.visitor) {
      visitorId = data.visitor._id;
    }
  } catch (err) { console.error('Error:', err); }

  // 8. Get All Visitors
  try {
    console.log('\n--- Test: Get All Visitors ---');
    const res = await fetch(`${baseUrl}/visitor`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Visitors count:`, data.visitors ? data.visitors.length : 0);
  } catch (err) { console.error('Error:', err); }

  // 9. Create Appointment
  try {
    console.log('\n--- Test: Create Appointment ---');
    const res = await fetch(`${baseUrl}/appointment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        host: adminId,
        visitor: visitorId,
        visitdate: new Date().toISOString(),
        purpose: 'Test Meeting'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response message:`, data.message);
    if(data.appointment) {
      appointmentId = data.appointment._id;
    }
  } catch (err) { console.error('Error:', err); }

  // 10. Approve Appointment
  if (appointmentId) {
    try {
      console.log('\n--- Test: Approve Appointment ---');
      const res = await fetch(`${baseUrl}/appointment/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      console.log(`Response message:`, data.message);
    } catch (err) { console.error('Error:', err); }
  } else {
    console.log('\n--- Test: Approve Appointment (Skipped) ---');
  }

  // 11. Generate Pass
  if (appointmentId) {
    try {
      console.log('\n--- Test: Generate Pass ---');
      const res = await fetch(`${baseUrl}/passes/${appointmentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      console.log(`Response message:`, data.message);
      if(data.pass && data.pass.passnumber) {
          console.log('Pass Number:', data.pass.passnumber);
      }
    } catch (err) { console.error('Error:', err); }
  } else {
    console.log('\n--- Test: Generate Pass (Skipped) ---');
  }

  console.log('\nFinished all tests.');
}

runTests();
