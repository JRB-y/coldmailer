<template>
  <div class="min-h-screen bg-black">
    <!-- Header -->
    <UiHeader />
    <main>
      <div class="max-w-7xl mx-auto px-4 pb-20 pt-8">
        <slot />
      </div>
    </main>
    <!-- Footer -->
    <UiFooter />
  </div>
</template>
