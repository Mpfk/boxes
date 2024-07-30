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
              <input class="form-control" type="file" id="formFile" @change="handleFileUpload" :disabled="fileUploaded" />
            </div>
            <ul class="list-group mt-3" v-if="importStatus.length > 0">
              <li v-for="(status, index) in importStatus" :key="index" 
                  :class="['list-group-item', status.success ? 'list-group-item-success' : 'list-group-item-danger']">
                {{ status.boxID }} - {{ status.boxName }} - {{ status.itemID }} - {{ status.itemName }}: {{ status.message }}
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="isImporting">
              <span v-if="isImporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span v-if="!isImporting && !importCompleted">Close</span>
              <span v-if="importCompleted">Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { importData } from '../../utils/dataImport';

export default {
  name: 'ImportData',
  setup() {
    const importStatus = ref([]);
    const fileUploaded = ref(false);
    const importCompleted = ref(false);
    const isImporting = ref(false);

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
            await importData(jsonData, (boxID, boxName, itemID, itemName, success, message) => {
              importStatus.value.push({ boxID, boxName, itemID, itemName, success, message: success ? 'Imported successfully' : `Error: ${message}` });
            });
            importCompleted.value = true;
          } catch (error) {
            console.error('Error importing data:', error);
            alert('Failed to import data.');
          } finally {
            isImporting.value = false;
          }
        };
        reader.readAsText(file);
      }
    };

    return {
      handleFileUpload,
      importStatus,
      fileUploaded,
      importCompleted,
      isImporting
    };
  }
};
</script>

<style scoped>
/* Add any necessary styling here */
</style>