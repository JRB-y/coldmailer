<script setup lang="ts">
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-vue-next'

interface ValidationResult {
  email: string
  status: 'valid' | 'invalid' | 'risky' | 'unknown'
  riskScore: number
  checks: any
  reason: string
  executionTime?: number
}

interface Props {
  role: 'user' | 'assistant'
  content: string
  validationResults?: ValidationResult[]
  timestamp?: Date
}

const props = defineProps<Props>()

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'valid': return CheckCircle2
    case 'invalid': return XCircle
    case 'risky': return AlertTriangle
    default: return HelpCircle
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'valid': return 'text-green-500'
    case 'invalid': return 'text-red-500'
    case 'risky': return 'text-yellow-500'
    default: return 'text-gray-500'
  }
}

const getRiskScoreColor = (score: number) => {
  if (score < 30) return 'text-green-500'
  if (score < 60) return 'text-yellow-500'
  return 'text-red-500'
}
</script>

<template>
  <div :class="['flex gap-3 mb-4', role === 'user' ? 'justify-end' : 'justify-start']">
    <!-- Avatar -->
    <div v-if="role === 'assistant'" class="flex-shrink-0">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
        AI
      </div>
    </div>

    <!-- Message Content -->
    <div :class="[
      'max-w-[80%] rounded-2xl px-4 py-3',
      role === 'user'
        ? 'bg-blue-600 text-white'
        : 'bg-zinc-800 text-gray-100 border border-zinc-700'
    ]">
      <!-- Text Content -->
      <div class="whitespace-pre-wrap break-words text-sm">{{ content }}</div>

      <!-- Validation Results -->
      <div v-if="validationResults && validationResults.length > 0" class="mt-4 space-y-3">
        <div
          v-for="(result, index) in validationResults"
          :key="index"
          class="bg-zinc-900 rounded-lg p-4 border border-zinc-700"
        >
          <!-- Email and Status -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-mono text-gray-300 truncate">{{ result.email }}</p>
              <div class="flex items-center gap-2 mt-1">
                <component
                  :is="getStatusIcon(result.status)"
                  :class="['w-4 h-4', getStatusColor(result.status)]"
                />
                <span :class="['text-sm font-medium uppercase', getStatusColor(result.status)]">
                  {{ result.status }}
                </span>
              </div>
            </div>
            <div class="text-right ml-4">
              <p class="text-xs text-gray-500">Risk Score</p>
              <p :class="['text-xl font-bold', getRiskScoreColor(result.riskScore)]">
                {{ result.riskScore }}/100
              </p>
            </div>
          </div>

          <!-- Reason -->
          <p class="text-xs text-gray-400 mb-3">{{ result.reason }}</p>

          <!-- Checks Grid -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex items-center gap-1">
              <div :class="result.checks.syntax ? 'text-green-500' : 'text-red-500'">●</div>
              <span class="text-gray-400">Syntax</span>
            </div>
            <div class="flex items-center gap-1">
              <div :class="result.checks.dns ? 'text-green-500' : 'text-red-500'">●</div>
              <span class="text-gray-400">DNS</span>
            </div>
            <div class="flex items-center gap-1">
              <div :class="result.checks.mx ? 'text-green-500' : 'text-red-500'">●</div>
              <span class="text-gray-400">MX Records</span>
            </div>
            <div class="flex items-center gap-1">
              <div :class="result.checks.smtp ? 'text-green-500' : 'text-red-500'">●</div>
              <span class="text-gray-400">SMTP</span>
            </div>
            <div class="flex items-center gap-1">
              <div :class="!result.checks.disposable ? 'text-green-500' : 'text-red-500'">●</div>
              <span class="text-gray-400">Not Disposable</span>
            </div>
            <div class="flex items-center gap-1">
              <div :class="!result.checks.suspiciousPattern ? 'text-green-500' : 'text-red-500'">●</div>
              <span class="text-gray-400">No Suspicious</span>
            </div>
          </div>

          <!-- Execution Time -->
          <p v-if="result.executionTime" class="text-xs text-gray-500 mt-3">
            Validated in {{ result.executionTime }}ms
          </p>
        </div>
      </div>

      <!-- Timestamp -->
      <p v-if="timestamp" class="text-xs opacity-60 mt-2">
        {{ timestamp.toLocaleTimeString() }}
      </p>
    </div>

    <!-- User Avatar -->
    <div v-if="role === 'user'" class="flex-shrink-0">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
        U
      </div>
    </div>
  </div>
</template>
