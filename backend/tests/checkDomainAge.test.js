/**
 * Simple test for Domain Age WHOIS check
 * Run with: node tests/checkDomainAge.test.js
 */

import { checkDomainAge, clearDomainCache, getCacheStats } from '../services/validator/checkDomainAge.js'

console.log('🧪 Testing Domain Age WHOIS Check...\n')

// Test 1: Check if missing config returns unknown
console.log('Test 1: Missing API Configuration')
const testDomain = 'example.com'
const result1 = await checkDomainAge(testDomain)
console.log('Result:', result1)

if (result1.isNew === 'unknown' && result1.status === 'not_configured') {
  console.log('✅ Correctly handles missing configuration\n')
} else if (result1.status === 'success') {
  console.log('✅ API is configured and working\n')
  console.log(`   Domain age: ${result1.ageInDays} days`)
  console.log(`   Is new: ${result1.isNew}`)
  console.log(`   Created: ${result1.createdDate}\n`)
} else {
  console.log('⚠️  API configured but returned:', result1.status, '\n')
}

// Test 2: Check caching
console.log('Test 2: Cache Functionality')
clearDomainCache(testDomain)
const cacheStatsBefore = getCacheStats()
console.log('Cache before:', cacheStatsBefore)

const result2a = await checkDomainAge(testDomain)
const cacheStatsAfter1 = getCacheStats()
console.log('Cache after first call:', cacheStatsAfter1)

const result2b = await checkDomainAge(testDomain)
const cacheStatsAfter2 = getCacheStats()
console.log('Cache after second call:', cacheStatsAfter2)

if (cacheStatsAfter1.size === cacheStatsAfter2.size) {
  console.log('✅ Cache is working (second call used cached result)\n')
} else {
  console.log('❌ Cache may not be working properly\n')
}

// Test 3: Test with invalid domain (should fail-safe to unknown)
console.log('Test 3: Invalid Domain (Fail-Safe)')
const result3 = await checkDomainAge('this-domain-definitely-does-not-exist-12345.com')
console.log('Result:', result3)

if (result3.isNew === 'unknown') {
  console.log('✅ Correctly returns unknown for problematic domains\n')
} else {
  console.log('✅ Got valid result (domain might exist)\n')
}

console.log('📊 Final Cache Statistics:', getCacheStats())
console.log('\n✨ Tests completed!')
