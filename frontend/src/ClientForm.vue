<script setup lang="ts">
export type FormData = { full_name: string; email: string; phone: string; company: string };
export type FormErrors = Partial<Record<keyof FormData, string>>;

const props = defineProps<{ modelValue: FormData; errors: FormErrors }>();
const emit = defineEmits<{
  "update:modelValue": [value: FormData];
  "update:errors": [errors: FormErrors];
}>();

function update(field: keyof FormData, value: string) {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
  const next = { ...props.errors };
  delete next[field];
  emit("update:errors", next);
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Full name <span class="text-red-500">*</span>
    </label>
    <input
      :value="modelValue.full_name"
      type="text"
      class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      :class="errors.full_name ? 'border-red-400' : 'border-gray-300'"
      @input="update('full_name', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="errors.full_name" class="mt-1 text-xs text-red-600">{{ errors.full_name }}</p>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Email <span class="text-red-500">*</span>
    </label>
    <input
      :value="modelValue.email"
      type="email"
      class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      :class="errors.email ? 'border-red-400' : 'border-gray-300'"
      @input="update('email', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
    <input
      :value="modelValue.phone"
      type="tel"
      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      @input="update('phone', ($event.target as HTMLInputElement).value)"
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Company <span class="text-red-500">*</span>
    </label>
    <input
      :value="modelValue.company"
      type="text"
      class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      :class="errors.company ? 'border-red-400' : 'border-gray-300'"
      @input="update('company', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="errors.company" class="mt-1 text-xs text-red-600">{{ errors.company }}</p>
  </div>
</template>
