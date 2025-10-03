import { isDisposableEmail, isDisposableEmailDomain } from 'disposable-email-domains-js'

export function isDisposable(domain, email) {
  return isDisposableEmailDomain(domain.toLowerCase()) && isDisposableEmail(email.toLowerCase())
}
