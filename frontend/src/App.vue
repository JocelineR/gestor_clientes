<script setup lang="ts">
import { ref, onMounted } from "vue";
import { z } from "zod";
import {
  ClientSchema,
  ClientInputSchema,
  type Client,
} from "@shared/clientSchema";
import ClientTable from "./ClientTable.vue";
import ClientForm, { type FormData, type FormErrors } from "./ClientForm.vue";

const ClientListSchema = z.array(ClientSchema);

// --- client list ---
const clients = ref<Client[]>([]);
const error = ref<string | null>(null);

async function loadClients() {
  error.value = null;
  const res = await fetch("/clients");
  if (!res.ok) {
    error.value = "Failed to load clients";
    return;
  }
  const result = ClientListSchema.safeParse(await res.json());
  if (!result.success) {
    error.value = "Unexpected response shape from server";
    return;
  }
  clients.value = result.data;
}

onMounted(loadClients);

// --- shared form validation ---
function parseForm(data: FormData) {
  return ClientInputSchema.safeParse({ ...data, phone: data.phone || null });
}

function extractErrors(result: ReturnType<typeof parseForm>): FormErrors {
  if (result.success) return {};
  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FormData;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

const emptyForm = (): FormData => ({
  full_name: "",
  email: "",
  phone: "",
  company: "",
});

// --- create dialog ---
const createDialog = ref<HTMLDialogElement | null>(null);
const createForm = ref<FormData>(emptyForm());
const createErrors = ref<FormErrors>({});
const createSubmitting = ref(false);

function openCreateDialog() {
  createForm.value = emptyForm();
  createErrors.value = {};
  createDialog.value?.showModal();
}

async function submitCreate() {
  const result = parseForm(createForm.value);
  if (!result.success) {
    createErrors.value = extractErrors(result);
    return;
  }
  createSubmitting.value = true;
  try {
    const res = await fetch("/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
    if (!res.ok) {
      error.value = "Failed to create client";
      return;
    }
    createDialog.value?.close();
    await loadClients();
  } finally {
    createSubmitting.value = false;
  }
}

// --- edit dialog ---
const editDialog = ref<HTMLDialogElement | null>(null);
const editForm = ref<FormData>(emptyForm());
const editErrors = ref<FormErrors>({});
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

async function submitEdit() {
  const result = parseForm(editForm.value);
  if (!result.success) {
    editErrors.value = extractErrors(result);
    return;
  }
  if (editingId.value === null) return;
  editSubmitting.value = true;
  try {
    const res = await fetch(`/clients/${editingId.value}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
    if (!res.ok) {
      error.value = "Failed to update client";
      return;
    }
    editDialog.value?.close();
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

async function confirmDelete() {
  if (!clientToDelete.value) return;
  const res = await fetch(`/clients/${clientToDelete.value.id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    error.value = "Failed to delete client";
  }
  deleteDialog.value?.close();
  clientToDelete.value = null;
  await loadClients();
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Muebles CRM — Clients</h1>
        <button
          @click="openCreateDialog"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
        >
          Create client
        </button>
      </div>

      <div
        v-if="error"
        class="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm"
      >
        {{ error }}
      </div>

      <div v-if="clients.length === 0 && !error" class="text-center py-16">
        <p class="text-gray-500 mb-4">No clients yet.</p>
        <button @click="openCreateDialog" class="text-blue-500 underline">
          Create your first client
        </button>
      </div>

      <ClientTable
        v-else
        :clients="clients"
        @edit="openEditDialog"
        @delete="openDeleteDialog"
      />
    </div>
  </div>

  <!-- Create dialog -->
  <dialog
    ref="createDialog"
    class="rounded-lg shadow-xl p-0 w-full max-w-md backdrop:bg-black/40"
    @click.self="createDialog?.close()"
  >
    <form
      @submit.prevent="submitCreate"
      novalidate
      class="p-6 flex flex-col gap-4"
    >
      <h2 class="text-lg font-semibold text-gray-800">Create client</h2>
      <ClientForm v-model="createForm" v-model:errors="createErrors" />
      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          @click="createDialog?.close()"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="createSubmitting"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm font-medium"
        >
          {{ createSubmitting ? "Creating…" : "Create" }}
        </button>
      </div>
    </form>
  </dialog>

  <!-- Edit dialog -->
  <dialog
    ref="editDialog"
    class="rounded-lg shadow-xl p-0 w-full max-w-md backdrop:bg-black/40"
    @click.self="editDialog?.close()"
  >
    <form
      @submit.prevent="submitEdit"
      novalidate
      class="p-6 flex flex-col gap-4"
    >
      <h2 class="text-lg font-semibold text-gray-800">Edit client</h2>
      <ClientForm v-model="editForm" v-model:errors="editErrors" />
      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          @click="editDialog?.close()"
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

  <!-- Delete dialog -->
  <dialog
    ref="deleteDialog"
    class="rounded-lg shadow-xl p-0 w-full max-w-sm backdrop:bg-black/40"
    @click.self="deleteDialog?.close()"
  >
    <div v-if="clientToDelete" class="p-6 flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-gray-800">Delete client?</h2>
      <div class="bg-gray-50 rounded p-3 text-sm space-y-1">
        <p>
          <span class="text-gray-500">Name:</span>
          {{ clientToDelete.full_name }}
        </p>
        <p>
          <span class="text-gray-500">Email:</span> {{ clientToDelete.email }}
        </p>
        <p v-if="clientToDelete.phone">
          <span class="text-gray-500">Phone:</span> {{ clientToDelete.phone }}
        </p>
        <p>
          <span class="text-gray-500">Company:</span>
          {{ clientToDelete.company }}
        </p>
      </div>
      <p class="text-sm text-gray-500">This cannot be undone.</p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="deleteDialog?.close()"
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
</template>
