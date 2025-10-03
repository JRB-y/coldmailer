/**
 * Check for bad keywords in the local-part of the email (before @).
 * Returns true if suspicious/undesirable keywords are found.
 */
export function checkBadKeywords(email) {
  const localPart = email.split('@')[0]

  // List of flagged keywords
  const badKeywords = [
    'porn',
    'sex',
    'xxx',
    'spam',
    'fake',
    'test',
    'trash',
    'dummy',
    'noreply',
    'no-reply',
  ]

  return badKeywords.some((keyword) => localPart.includes(keyword))
}
