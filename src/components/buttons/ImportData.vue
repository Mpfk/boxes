<template>
  <div>
    <!-- Import Button -->
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#importModal">
      Import Data
    </button>

    <!-- Modal -->
    <div class="modal fade" id="importModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="importModalLabel">Import Data</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
            <span v-if="duplicates.length > 0">{{ duplicates.length }} Duplicates Found</span>
            <button v-if="duplicates.length > 0" class="btn btn-secondary me-2" @click="handleDuplicatesAction('ignore')">Ignore</button>
            <button v-if="duplicates.length > 0" class="btn btn-warning me-2" @click="handleDuplicatesAction('overwrite')">Overwrite</button>
            <button v-if="duplicates.length > 0" class="btn btn-primary" @click="handleDuplicatesAction('add')">Duplicate</button>
            <button v-else type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="isImporting">
              <span v-if="isImporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span v-if="!isImporting && !importCompleted">Close</span>
              <span v-if="importCompleted && !hasErrors">Done</span>
              <span v-if="importCompleted && hasErrors">Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { importData, handleDuplicates as handleDuplicatesFn } from '../../utils/dataImport';

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
            duplicates.value = await importData(jsonData, (boxID, boxName, itemID, itemName, importStatus, message) => {
              importStatusList.value.push({ boxID, boxName, itemID, itemName, importStatus, message });
              if (importStatus === 'failure') {
                hasErrors.value = true;
              }
            });
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
      duplicates.value = []; // Clear duplicates list after handling
    };

    const resetForm = () => {
      importStatusList.value = [];
      fileUploaded.value = false;
      importCompleted.value = false;
      isImporting.value = false;
      hasErrors.value = false;
      duplicates.value = [];
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
      importStatusList,
      fileUploaded,
      importCompleted,
      isImporting,
      hasErrors,
      formFile,
      duplicates
    };
  }
};
</script>

<style scoped>
/* Add any necessary styling here */
</style>
