import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';

export async function getMyProfile(user) {
  const profiles = await query('SELECT * FROM profiles WHERE user_id = ? LIMIT 1', [user.id]);
  const profile = profiles[0] || {};

  return {
    user_id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    role: user.role,
    account_status: user.account_status,
    kyc_status: user.kyc_status,
    profile_completed: Boolean(user.profile_completed),
    profile: {
      full_name: profile.full_name || null,
      date_of_birth: profile.date_of_birth || null,
      gender: profile.gender || null,
      relationship: profile.relationship || null,
      relationship_other: profile.relationship_other || null,
      address: profile.address_line
        ? {
            address_line: profile.address_line || '',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
          }
        : null,
      profile_image_url: profile.profile_image_url || null,
      pan: profile.pan || null,
      aadhar: profile.aadhar || null,
      account_number: profile.account_number || null,
      ifsc: profile.ifsc || null,
      nominee_name: profile.nominee_name || null,
      nominee_mobile: profile.nominee_mobile || null,
      nominee_dob: profile.nominee_dob || null,
      nominee_address: profile.nominee_address || null,
    },
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function updateMyProfile(user, data) {
  const existingProfiles = await query('SELECT * FROM profiles WHERE user_id = ? LIMIT 1', [user.id]);

  let profile = existingProfiles[0];
  if (!profile) {
    const profileId = uuidv4();
    await query(
      'INSERT INTO profiles (id, user_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [profileId, user.id]
    );
    const created = await query('SELECT * FROM profiles WHERE id = ?', [profileId]);
    profile = created[0];
  }

  const updates = [];
  const params = [];

  if (data.full_name !== undefined) {
    updates.push('full_name = ?');
    params.push(data.full_name);
    // Also update display name on user
    await query('UPDATE users SET name = ? WHERE id = ?', [data.full_name, user.id]);
  }
  if (data.date_of_birth !== undefined) {
    updates.push('date_of_birth = ?');
    params.push(data.date_of_birth);
  }
  if (data.gender !== undefined) {
    updates.push('gender = ?');
    params.push(data.gender);
  }
  if (data.relationship !== undefined) {
    updates.push('relationship = ?');
    params.push(data.relationship);
    if (data.relationship === 'other') {
      updates.push('relationship_other = ?');
      params.push(data.relationship_other || null);
    } else {
      updates.push('relationship_other = NULL');
    }
  }
  if (data.profile_image_url !== undefined) {
    updates.push('profile_image_url = ?');
    params.push(data.profile_image_url);
  }
  if (data.pan !== undefined) {
    updates.push('pan = ?');
    params.push(data.pan);
  }
  if (data.aadhar !== undefined) {
    updates.push('aadhar = ?');
    params.push(data.aadhar);
  }
  if (data.account_number !== undefined) {
    updates.push('account_number = ?');
    params.push(data.account_number);
  }
  if (data.ifsc !== undefined) {
    updates.push('ifsc = ?');
    params.push(data.ifsc);
  }
  if (data.nominee_name !== undefined) {
    updates.push('nominee_name = ?');
    params.push(data.nominee_name);
  }
  if (data.nominee_mobile !== undefined) {
    updates.push('nominee_mobile = ?');
    params.push(data.nominee_mobile);
  }
  if (data.nominee_dob !== undefined) {
    updates.push('nominee_dob = ?');
    params.push(data.nominee_dob);
  }
  if (data.nominee_address !== undefined) {
    updates.push('nominee_address = ?');
    params.push(data.nominee_address);
  }

  // Address updates
  if (data.address && typeof data.address === 'object') {
    if (data.address.address_line !== undefined) {
      updates.push('address_line = ?');
      params.push(data.address.address_line);
    }
    if (data.address.city !== undefined) {
      updates.push('city = ?');
      params.push(data.address.city);
    }
    if (data.address.state !== undefined) {
      updates.push('state = ?');
      params.push(data.address.state);
    }
    if (data.address.pincode !== undefined) {
      updates.push('pincode = ?');
      params.push(data.address.pincode);
    }
  }

  if (updates.length > 0) {
    updates.push('updated_at = NOW()');
    params.push(user.id);
    await query(`UPDATE profiles SET ${updates.join(', ')} WHERE user_id = ?`, params);
  }

  // Mark profile completed
  await query('UPDATE users SET profile_completed = 1, updated_at = NOW() WHERE id = ?', [user.id]);
  const freshUsers = await query('SELECT * FROM users WHERE id = ?', [user.id]);

  return getMyProfile(freshUsers[0]);
}

export async function getAdminUsers({ page = 1, limit = 20, search, status_filter, kyc_status_filter }) {
  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const whereClauses = [];
  const params = [];

  if (status_filter) {
    whereClauses.push('account_status = ?');
    params.push(status_filter.toLowerCase().trim());
  }

  if (kyc_status_filter) {
    whereClauses.push('kyc_status = ?');
    params.push(kyc_status_filter.toLowerCase().trim());
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClauses.push('(name LIKE ? OR mobile LIKE ? OR email LIKE ?)');
    params.push(term, term, term);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countRows = await query(`SELECT COUNT(*) as total FROM users ${whereSql}`, params);
  const total = countRows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  const items = await query(
    `SELECT id as user_id, name, mobile, email, role, account_status, kyc_status, created_at 
     FROM users 
     ${whereSql} 
     ORDER BY created_at DESC 
     LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    total_pages: totalPages,
  };
}

export async function getAdminUserDetail(userId) {
  const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  if (users.length === 0) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  const user = users[0];
  const profiles = await query('SELECT * FROM profiles WHERE user_id = ? LIMIT 1', [userId]);
  const profile = profiles[0] || {};

  return {
    user_id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    role: user.role,
    account_status: user.account_status,
    kyc_status: user.kyc_status,
    profile: {
      full_name: profile.full_name || null,
      date_of_birth: profile.date_of_birth || null,
      gender: profile.gender || null,
      relationship: profile.relationship || null,
      relationship_other: profile.relationship_other || null,
      address: profile.address_line
        ? {
            address_line: profile.address_line || '',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
          }
        : null,
      profile_image_url: profile.profile_image_url || null,
      pan: profile.pan || null,
      aadhar: profile.aadhar || null,
      account_number: profile.account_number || null,
      ifsc: profile.ifsc || null,
      nominee_name: profile.nominee_name || null,
      nominee_mobile: profile.nominee_mobile || null,
      nominee_dob: profile.nominee_dob || null,
      nominee_address: profile.nominee_address || null,
    },
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function updateUserStatusByAdmin(userId, newStatus, adminUser) {
  const validStatuses = ['active', 'suspended', 'banned'];
  const cleanedStatus = (newStatus || '').toLowerCase().trim();

  if (!validStatuses.includes(cleanedStatus)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    error.status = 400;
    throw error;
  }

  const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  if (users.length === 0) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (users[0].role === 'admin') {
    const error = new Error('Cannot modify another administrator account');
    error.status = 403;
    throw error;
  }

  await query('UPDATE users SET account_status = ?, updated_at = NOW() WHERE id = ?', [cleanedStatus, userId]);

  const messages = {
    banned: 'User banned successfully',
    suspended: 'User suspended successfully',
    active: 'User status updated successfully',
  };

  return {
    message: messages[cleanedStatus] || 'User status updated successfully',
    status: cleanedStatus,
  };
}

export default {
  getMyProfile,
  updateMyProfile,
  getAdminUsers,
  getAdminUserDetail,
  updateUserStatusByAdmin,
};
