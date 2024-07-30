<template>
  <div>
    <!-- Import Button -->
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#importModal">
      Import Data
    </button>

    <!-- Modal -->
    <div class="modal fade" id="importModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="importModalLabel">Import Data</h5>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="formFile" class="form-label">Upload JSON File</label>
              <input class="form-control" type="file" id="formFile" ref="formFile" @change="handleFileUpload" :disabled="fileUploaded" />
            </div>
            <ul class="list-group mt-3" v-if="importStatusList.length > 0">
              <li v-for="(status, index) in importStatusList" :key="index" 
                  :class="['list-group-item', status.importStatus === 'success' ? 'list-group-item-success' : (status.importStatus === 'warning' ? 'list-group-item-warning' : (status.importStatus === 'ignored' ? 'list-group-item-secondary' : 'list-group-item-danger'))]">
                {{ status.boxID }} - {{ status.boxName }} - {{ status.itemID }} - {{ status.itemName }}: {{ status.message }}
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <template v-if="duplicates.length > 0 && !duplicatesHandled">
              <span>{{ duplicates.length }} Duplicates Found</span>
              <button class="btn btn-secondary me-2" @click="handleDuplicatesAction('ignore')">Ignore</button>
              <button class="btn btn-warning me-2" @click="handleDuplicatesAction('overwrite')">Overwrite</button>
              <button class="btn btn-success" @click="handleDuplicatesAction('add')">Duplicate</button>
            </template>
            <template v-if="orphans.length > 0 && (duplicates.length === 0 || duplicatesHandled)">
              <span>{{ orphans.length }} Items Without Boxes</span>
              <button class="btn btn-secondary me-2" @click="handleOrphansAction('ignore')">Ignore</button>
              <button class="btn btn-success" @click="handleOrphansAction('import')">Import</button>
            </template>
            <button v-if="isImporting" type="button" class="btn btn-primary" disabled>
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
            <button v-else-if="!isImporting && !duplicates.length && !orphans.length" type="button" class="btn btn-primary" data-bs-dismiss="modal">
              Close
            </button>
            <button v-else type="button" class="btn btn-primary" disabled>
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { importData, handleDuplicates as handleDuplicatesFn, handleOrphans as handleOrphansFn } from '../../utils/dataImport';

export default {
  name: 'ImportData',
  setup() {
    const importStatusList = ref([]);
    const fileUploaded = ref(false);
    const importCompleted = ref(false);
    const isImporting = ref(false);
    const hasErrors = ref(false);
    const formFile = ref(null);
    const duplicates = ref([]);
    const orphans = ref([]);
    const duplicatesHandled = ref(false);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        fileUploaded.value = true;
        isImporting.value = true;
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target.result;
          try {
            const jsonData = JSON.parse(content);
            const { duplicates: dupItems, orphans: orphanItems } = await importData(jsonData, (boxID, boxName, itemID, itemName, importStatus, message) => {
              importStatusList.value.push({ boxID, boxName, itemID, itemName, importStatus, message });
              if (importStatus === 'failure') {
                hasErrors.value = true;
              }
            });
            duplicates.value = dupItems;
            orphans.value = orphanItems;
            importCompleted.value = true;
          } catch (error) {
            console.error('Error parsing or importing data:', error);
            alert('Failed to import data.');
            hasErrors.value = true;
          } finally {
            isImporting.value = false;
          }
        };
        reader.readAsText(file);
      }
    };

    const handleDuplicatesAction = async (action) => {
      isImporting.value = true;
      await handleDuplicatesFn(duplicates.value, action, (boxID, boxName, itemID, itemName, importStatus, message) => {
        const status = importStatusList.value.find(status => status.boxID === boxID && status.itemID === itemID);
        if (status) {
          status.importStatus = importStatus;
          status.message = message;
        }
      });
      isImporting.value = false;
      duplicatesHandled.value = true;
      duplicates.value = []; // Clear duplicates list after handling
    };

    const handleOrphansAction = async (action) => {
      isImporting.value = true;
      await handleOrphansFn(orphans.value, action, (boxID, boxName, itemID, itemName, importStatus, message) => {
        const status = importStatusList.value.find(status => status.boxID === boxID && status.itemID === itemID);
        if (status) {
          status.importStatus = importStatus;
          status.message = message;
        }
      });
      isImporting.value = false;
      orphans.value = []; // Clear orphans list after handling
    };

    const resetForm = () => {
      importStatusList.value = [];
      fileUploaded.value = false;
      importCompleted.value = false;
      isImporting.value = false;
      hasErrors.value = false;
      duplicates.value = [];
      orphans.value = [];
      duplicatesHandled.value = false;
      if (formFile.value) {
        formFile.value.value = '';
      }
    };

    onMounted(() => {
      const modal = document.getElementById('importModal');
      modal.addEventListener('hidden.bs.modal', resetForm);
    });

    return {
      handleFileUpload,
      handleDuplicatesAction,
      handleOrphansAction,
      importStatusList,
      fileUploaded,
      importCompleted,
      isImporting,
      hasErrors,
      formFile,
      duplicates,
      orphans,
      duplicatesHandled
    };
  }
};
</script>

<style scoped>
/* Add any necessary styling here */
</style>
