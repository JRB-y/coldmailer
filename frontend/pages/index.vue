<script setup lang="ts">
import { CheckCircle, Shield, Zap, BarChart3, ArrowRight, Mail } from 'lucide-vue-next'

definePageMeta({
  ssr: false,
})

const { user, isAuthenticated } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <UiHeader />

    <!-- Hero Section -->
    <main>
      <div class="max-w-7xl mx-auto px-4 py-20">
        <div class="text-center max-w-4xl mx-auto mb-20">
          <h1 class="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span
              class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Validate emails
            </span>
            <br />
            <span class="text-white">before you send</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed">
            Protect your domain reputation. Reduce bounce rates.<br />
            Increase email deliverability with our 8-point validation system.
          </p>
          <div class="flex items-center justify-center gap-4">
            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/signup"
              class="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
            <NuxtLink
              v-else
              to="/dashboard"
              class="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-3 gap-8 mb-20">
          <!-- Feature 1 -->
          <div
            class="bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500/50 transition-colors"
          >
            <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle class="w-6 h-6 text-blue-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">8-Point Validation</h3>
            <p class="text-gray-400 leading-relaxed">
              Comprehensive checks including syntax, DNS, MX records, SMTP verification, and more.
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-purple-500/50 transition-colors"
          >
            <div
              class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4"
            >
              <Zap class="w-6 h-6 text-purple-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Real-time Results</h3>
            <p class="text-gray-400 leading-relaxed">
              Get instant validation feedback with detailed risk scoring and actionable insights.
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-pink-500/50 transition-colors"
          >
            <div class="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
              <Shield class="w-6 h-6 text-pink-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Protect Your Reputation</h3>
            <p class="text-gray-400 leading-relaxed">
              Detect disposable emails, role accounts, and suspicious patterns before they harm your
              sender score.
            </p>
          </div>
        </div>

        <!-- Stats Section -->
        <div
          class="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-gray-800 rounded-2xl p-12 text-center mb-20"
        >
          <div class="grid md:grid-cols-3 gap-8">
            <div>
              <div
                class="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
              >
                99.5%
              </div>
              <div class="text-gray-400">Accuracy Rate</div>
            </div>
            <div>
              <div
                class="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
              >
                1000+
              </div>
              <div class="text-gray-400">Free Credits</div>
            </div>
            <div>
              <div
                class="text-5xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-2"
              >
                &lt;2s
              </div>
              <div class="text-gray-400">Avg. Response</div>
            </div>
          </div>
        </div>

        <!-- How It Works -->
        <div class="max-w-4xl mx-auto mb-20">
          <h2 class="text-4xl font-bold text-white text-center mb-12">How It Works</h2>
          <div class="space-y-6">
            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold"
              >
                1
              </div>
              <div>
                <h4 class="text-xl font-semibold text-white mb-2">Sign Up & Get Free Credits</h4>
                <p class="text-gray-400">
                  Create your account and receive 1000 free validation credits to get started.
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold"
              >
                2
              </div>
              <div>
                <h4 class="text-xl font-semibold text-white mb-2">Validate Emails</h4>
                <p class="text-gray-400">
                  Enter email addresses one by one or upload a CSV for bulk validation.
                </p>
              </div>
            </div>
            <div class="flex gap-6 items-start">
              <div
                class="flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold"
              >
                3
              </div>
              <div>
                <h4 class="text-xl font-semibold text-white mb-2">Get Detailed Results</h4>
                <p class="text-gray-400">
                  Receive comprehensive validation reports with risk scores and recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="text-center">
          <div class="inline-block bg-zinc-900 border border-gray-800 rounded-2xl p-12">
            <Mail class="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 class="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p class="text-gray-400 mb-8 max-w-md mx-auto">
              Join thousands of marketers protecting their sender reputation with ColdMailer.
            </p>
            <NuxtLink
              v-if="!isAuthenticated"
              to="/auth/signup"
              class="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors"
            >
              Get 1000 Free Credits
              <ArrowRight class="w-5 h-5" />
            </NuxtLink>
            <NuxtLink
              v-else
              to="/dashboard"
              class="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors"
            >
              Go to Dashboard
              <ArrowRight class="w-5 h-5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-8 px-4 mt-20 border-t border-gray-800">
      <div class="max-w-7xl mx-auto text-center text-gray-500">
        <p>&copy; 2025 ColdMailer. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
