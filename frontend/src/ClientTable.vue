<script setup lang="ts">
import type { Client } from "@shared/clientSchema";

defineProps<{ clients: Client[] }>();
const emit = defineEmits<{
  edit: [client: Client];
  delete: [client: Client];
}>();

function empty(val: string | null | undefined) {
  return val === null || val === undefined || val === "";
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg shadow">
    <table class="w-full bg-white text-sm">
      <thead class="bg-gray-800 text-white text-left">
        <tr>
          <th class="px-4 py-3">ID</th>
          <th class="px-4 py-3">Full Name</th>
          <th class="px-4 py-3">Email</th>
          <th class="px-4 py-3">Phone</th>
          <th class="px-4 py-3">Company</th>
          <th class="px-4 py-3">Created</th>
          <th class="px-4 py-3"></th>
          <th class="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="client in clients" :key="client.id" class="border-t hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-400">{{ client.id }}</td>
          <td class="px-4 py-3" :class="empty(client.full_name) ? 'bg-red-100 text-red-700' : ''">
            {{ client.full_name || "—" }}
          </td>
          <td class="px-4 py-3" :class="empty(client.email) ? 'bg-red-100 text-red-700' : ''">
            {{ client.email || "—" }}
          </td>
          <td class="px-4 py-3 text-gray-600">{{ client.phone || "—" }}</td>
          <td class="px-4 py-3" :class="empty(client.company) ? 'bg-red-100 text-red-700' : ''">
            {{ client.company || "—" }}
          </td>
          <td class="px-4 py-3 text-gray-400 text-xs">{{ client.created_at }}</td>
          <td class="px-4 py-3">
            <button
              @click="emit('edit', client)"
              class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
            >
              Edit
            </button>
          </td>
          <td class="px-4 py-3">
            <button
              @click="emit('delete', client)"
              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
