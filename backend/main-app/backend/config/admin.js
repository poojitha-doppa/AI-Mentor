function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function parseAdminEmails(raw = '') {
  return raw
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

const DEFAULT_ADMIN_EMAILS = [
  'harishbonu3@gmail.com',
  'poojithadoppa8@gmail.com'
];

const configuredAdminEmails = parseAdminEmails(process.env.ADMIN_EMAILS || '');
const adminEmailSet = new Set(
  configuredAdminEmails.length > 0 ? configuredAdminEmails : DEFAULT_ADMIN_EMAILS
);

function isAdminEmail(email = '') {
  return adminEmailSet.has(normalizeEmail(email));
}

async function ensureAdminRole(user) {
  if (!user) {
    return null;
  }

  const shouldBeAdmin = isAdminEmail(user.email);
  const nextRole = shouldBeAdmin ? 'admin' : (user.role === 'admin' ? 'user' : user.role || 'user');

  if (user.role !== nextRole) {
    user.role = nextRole;
    await user.save();
  }

  return user;
}

function getAdminEmails() {
  return Array.from(adminEmailSet);
}

export {
  normalizeEmail,
  isAdminEmail,
  ensureAdminRole,
  getAdminEmails
};
