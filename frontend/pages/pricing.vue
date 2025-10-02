<script setup lang="ts">
// TODO: Implement pricing page
// Features to add:
// - Display subscription tiers (Free, Starter, Pro, Enterprise)
// - Monthly/Yearly toggle
// - Feature comparison table
// - Call-to-action buttons
// - Stripe payment integration
// - Current plan indicator (if logged in)
// - FAQ section
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p class="text-xl text-gray-600">Choose the perfect plan for your needs</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card class="p-8">
          <h3 class="text-2xl font-bold mb-2">Starter</h3>
          <p class="text-gray-600 mb-4">For individuals</p>
          <p class="text-4xl font-bold mb-6">$29<span class="text-lg text-gray-600">/mo</span></p>
          <p class="text-gray-600">Plans coming soon...</p>
        </Card>

        <Card class="p-8 border-2 border-primary">
          <h3 class="text-2xl font-bold mb-2">Pro</h3>
          <p class="text-gray-600 mb-4">For teams</p>
          <p class="text-4xl font-bold mb-6">$99<span class="text-lg text-gray-600">/mo</span></p>
          <p class="text-gray-600">Plans coming soon...</p>
        </Card>

        <Card class="p-8">
          <h3 class="text-2xl font-bold mb-2">Enterprise</h3>
          <p class="text-gray-600 mb-4">For large organizations</p>
          <p class="text-4xl font-bold mb-6">Custom</p>
          <p class="text-gray-600">Plans coming soon...</p>
        </Card>
      </div>
    </div>
  </div>
</template>
