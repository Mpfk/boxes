<template>
  <div>
    <!-- Delete Button -->
    <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">
      Delete Data
    </button>

    <!-- Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Delete Data</h5>
          </div>
          <div class="modal-body">
            <p v-if="!isDeleting && !statusMessage">Are you sure you want to delete all of your boxes and their contents? This action cannot be undone.</p>
            <div class="alert alert-info mt-3 pt-2 pb-2" v-if="!isDeleting && !statusMessage">
              <p class="p-0 m-0"><small><strong>Consider making a backup first!</strong><br>Cancel and choose <code>Export Data</code>.</small></p>
            </div>
            <p v-if="!isDeleting && !statusMessage">Type <code>Delete all data</code> to confirm.</p>
            <div class="mb-3" v-if="!isDeleting && !statusMessage">
              <input 
                type="text" 
                class="form-control" 
                v-model="confirmationText" 
                placeholder="Delete all data" 
              />
            </div>
            <p v-if="isDeleting">Deleting...</p>
            <div class="progress" v-if="isDeleting">
              <div class="progress-bar bg-danger" role="progressbar" :style="{ width: progress + '%' }" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <p v-if="statusMessage">{{ statusMessage }}</p>
          </div>
          <div class="modal-footer">
            <button v-if="isDeleting" type="button" class="btn btn-danger" disabled>
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
            <button v-else-if="!isDeleting && statusMessage" type="button" class="btn btn-primary" data-bs-dismiss="modal">
              Close
            </button>
            <button v-else type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button 
              v-if="!isDeleting && !statusMessage" 
              type="button" 
              class="btn btn-danger" 
              @click="handleDelete" 
              :disabled="confirmationText !== 'Delete all data'"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { deleteData } from '../../utils/dataDelete';

export default {
  name: 'DeleteData',
  setup() {
    const progress = ref(0);
    const isDeleting = ref(false);
    const statusMessage = ref('');
    const confirmationText = ref('');

    const handleDelete = async () => {
      isDeleting.value = true;
      await deleteData(
        (newProgress) => {
          progress.value = newProgress;
        },
        (message) => {
          statusMessage.value = message;
        }
      );
      isDeleting.value = false;
    };

    return {
      progress,
      isDeleting,
      statusMessage,
      confirmationText,
      handleDelete
    };
  }
};
</script>

<style scoped>
/* Add any necessary styling here */
</style>
