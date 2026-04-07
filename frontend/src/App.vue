<script setup lang="ts">
import { ref, onMounted } from "vue";
import { z } from "zod";
import { ClientSchema, ClientInputSchema, type Client } from "@shared/clientSchema";

const ClientListSchema = z.array(ClientSchema);

// --- client list ---
const clients = ref<Client[]>([]);
const error = ref<string | null>(null);

async function loadClients() {
  error.value = null;
  const res = await fetch("/clients");
  if (!res.ok) { error.value = "Failed to load clients"; return; }
  const result = ClientListSchema.safeParse(await res.json());
  if (!result.success) { error.value = "Unexpected response shape from server"; return; }
  clients.value = result.data;
}

function deleteClient(client: Client) {
  openDeleteDialog(client);
}

function empty(val: string | null | undefined) {
  return val === null || val === undefined || val === "";
}

// --- edit dialog ---
const editDialog = ref<HTMLDialogElement | null>(null);
const editForm = ref({ full_name: "", email: "", phone: "", company: "" });
const editErrors = ref<Partial<Record<keyof typeof editForm.value, string>>>({});
const editingId = ref<number | null>(null);
const editSubmitting = ref(false);

function openEditDialog(client: Client) {
  editingId.value = client.id;
  editForm.value = {
    full_name: client.full_name,
    email: client.email,
    phone: client.phone ?? "",
    company: client.company,
  };
  editErrors.value = {};
  editDialog.value?.showModal();
}

function closeEditDialog() {
  editDialog.value?.close();
  editingId.value = null;
}

function validateEdit() {
  const result = ClientInputSchema.safeParse({
    ...editForm.value,
    phone: editForm.value.phone || null,
  });
  if (result.success) { editErrors.value = {}; return result.data; }
  editErrors.value = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof typeof editForm.value;
    if (field && !editErrors.value[field]) editErrors.value[field] = issue.message;
  }
  return null;
}

async function submitEdit() {
  const data = validateEdit();
  if (!data || editingId.value === null) return;
  editSubmitting.value = true;
  try {
    const res = await fetch(`/clients/${editingId.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { error.value = "Failed to update client"; return; }
    closeEditDialog();
    await loadClients();
  } finally {
    editSubmitting.value = false;
  }
}

// --- delete dialog ---
const deleteDialog = ref<HTMLDialogElement | null>(null);
const clientToDelete = ref<Client | null>(null);

function openDeleteDialog(client: Client) {
  clientToDelete.value = client;
  deleteDialog.value?.showModal();
}

function closeDeleteDialog() {
  deleteDialog.value?.close();
  clientToDelete.value = null;
}

async function confirmDelete() {
  if (!clientToDelete.value) return;
  const res = await fetch(`/clients/${clientToDelete.value.id}`, { method: "DELETE" });
  if (!res.ok) { error.value = "Failed to delete client"; }
  closeDeleteDialog();
  await loadClients();
}

// --- create dialog ---
const dialog = ref<HTMLDialogElement | null>(null);

const form = ref({ full_name: "", email: "", phone: "", company: "" });
const formErrors = ref<Partial<Record<keyof typeof form.value, string>>>({});
const submitting = ref(false);

function openDialog() {
  form.value = { full_name: "", email: "", phone: "", company: "" };
  formErrors.value = {};
  dialog.value?.showModal();
}

function closeDialog() {
  dialog.value?.close();
}

function validate() {
  const result = ClientInputSchema.safeParse({
    ...form.value,
    phone: form.value.phone || null,
  });

  if (result.success) {
    formErrors.value = {};
    return result.data;
  }

  const issues = result.error.issues;
  formErrors.value = {};
  for (const issue of issues) {
    const field = issue.path[0] as keyof typeof form.value;
    if (field && !formErrors.value[field]) {
      formErrors.value[field] = issue.message;
    }
  }
  return null;
}

async function submitCreate() {
  const data = validate();
  if (!data) return;

  submitting.value = true;
  try {
    const res = await fetch("/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      error.value = "Failed to create client";
      return;
    }

    closeDialog();
    await loadClients();
  } finally {
    submitting.value = false;
  }
}

onMounted(loadClients);
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-5xl mx-auto">

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Muebles CRM — Clients</h1>
        <button
          @click="openDialog"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          Create client
        </button>
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
        {{ error }}
      </div>

      <div v-if="clients.length === 0 && !error" class="text-center py-16">
        <p class="text-gray-400 mb-4">No clients yet.</p>
        <button
          @click="openDialog"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          Create client
        </button>
      </div>

      <div v-else class="overflow-x-auto rounded-lg shadow">
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
                  @click="openEditDialog(client)"
                  class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs"
                >
                  Edit
                </button>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="deleteClient(client)"
                  class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>

  <!-- Edit client dialog -->
  <dialog
    ref="editDialog"
    class="rounded-lg shadow-xl p-0 w-full max-w-md backdrop:bg-black/40"
    @click.self="closeEditDialog"
  >
    <form @submit.prevent="submitEdit" novalidate class="p-6 flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-gray-800">Edit client</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Full name <span class="text-red-500">*</span></label>
        <input
          v-model="editForm.full_name"
          type="text"
          class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="editErrors.full_name ? 'border-red-400' : 'border-gray-300'"
          @input="delete editErrors.full_name"
        />
        <p v-if="editErrors.full_name" class="mt-1 text-xs text-red-600">{{ editErrors.full_name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
        <input
          v-model="editForm.email"
          type="email"
          class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="editErrors.email ? 'border-red-400' : 'border-gray-300'"
          @input="delete editErrors.email"
        />
        <p v-if="editErrors.email" class="mt-1 text-xs text-red-600">{{ editErrors.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          v-model="editForm.phone"
          type="tel"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Company <span class="text-red-500">*</span></label>
        <input
          v-model="editForm.company"
          type="text"
          class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="editErrors.company ? 'border-red-400' : 'border-gray-300'"
          @input="delete editErrors.company"
        />
        <p v-if="editErrors.company" class="mt-1 text-xs text-red-600">{{ editErrors.company }}</p>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          @click="closeEditDialog"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="editSubmitting"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-medium"
        >
          {{ editSubmitting ? "Saving…" : "Save" }}
        </button>
      </div>
    </form>
  </dialog>

  <!-- Delete confirmation dialog -->
  <dialog
    ref="deleteDialog"
    class="rounded-lg shadow-xl p-0 w-full max-w-sm backdrop:bg-black/40"
    @click.self="closeDeleteDialog"
  >
    <div v-if="clientToDelete" class="p-6 flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-gray-800">Delete client?</h2>
      <div class="bg-gray-50 rounded p-3 text-sm space-y-1">
        <p><span class="text-gray-500">Name:</span> {{ clientToDelete.full_name }}</p>
        <p><span class="text-gray-500">Email:</span> {{ clientToDelete.email }}</p>
        <p v-if="clientToDelete.phone"><span class="text-gray-500">Phone:</span> {{ clientToDelete.phone }}</p>
        <p><span class="text-gray-500">Company:</span> {{ clientToDelete.company }}</p>
      </div>
      <p class="text-sm text-gray-500">This cannot be undone.</p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="closeDeleteDialog"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="confirmDelete"
          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  </dialog>

  <!-- Create client dialog -->
  <dialog
    ref="dialog"
    class="rounded-lg shadow-xl p-0 w-full max-w-md backdrop:bg-black/40"
    @click.self="closeDialog"
  >
    <form @submit.prevent="submitCreate" novalidate class="p-6 flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-gray-800">Create client</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Full name <span class="text-red-500">*</span></label>
        <input
          v-model="form.full_name"
          type="text"
          class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="formErrors.full_name ? 'border-red-400' : 'border-gray-300'"
          @input="delete formErrors.full_name"
        />
        <p v-if="formErrors.full_name" class="mt-1 text-xs text-red-600">{{ formErrors.full_name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
        <input
          v-model="form.email"
          type="email"
          class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="formErrors.email ? 'border-red-400' : 'border-gray-300'"
          @input="delete formErrors.email"
        />
        <p v-if="formErrors.email" class="mt-1 text-xs text-red-600">{{ formErrors.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          v-model="form.phone"
          type="tel"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Company <span class="text-red-500">*</span></label>
        <input
          v-model="form.company"
          type="text"
          class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="formErrors.company ? 'border-red-400' : 'border-gray-300'"
          @input="delete formErrors.company"
        />
        <p v-if="formErrors.company" class="mt-1 text-xs text-red-600">{{ formErrors.company }}</p>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          @click="closeDialog"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-medium"
        >
          {{ submitting ? "Creating…" : "Create" }}
        </button>
      </div>
    </form>
  </dialog>
</template>
