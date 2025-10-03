const roleBasedPrefixes = [
  'info',
  'admin',
  'administrator',
  'support',
  'help',
  'noreply',
  'no-reply',
  'no_reply',
  'donotreply',
  'sales',
  'marketing',
  'contact',
  'service',
  'postmaster',
  'webmaster',
  'hostmaster',
  'abuse',
  'security',
  'privacy',
  'billing',
  'accounts',
  'finance',
  'hr',
  'jobs',
  'careers',
  'recruitment',
  'team',
  'office',
  'hello',
  'hi',
  'mail',
  'email',
]

export function isRoleAccount(email) {
  const localPart = email.split('@')[0].toLowerCase()

  // Exact match
  if (roleBasedPrefixes.includes(localPart)) return true

  // Starts with role prefix (e.g., support-team, info.contact)
  return roleBasedPrefixes.some(
    (prefix) =>
      localPart.startsWith(prefix + '-') ||
      localPart.startsWith(prefix + '.') ||
      localPart.startsWith(prefix + '_')
  )
}
