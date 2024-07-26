<script setup lang="ts">
    // Imports
    import { ref, onMounted, watch, inject } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import ItemForm from './ItemForm.vue';
    import { generateClient } from 'aws-amplify/data';
    import type { Schema } from '../../amplify/data/resource';

    // Vars
    const route = useRoute();
    const router = useRouter();
    const client = generateClient<Schema>();
    const itemName = ref('');
    const boxID = ref('');
    const isSaveDisabled = ref(true);
    const setHotBarButtons = inject('setHotBarButtons');
    const addToast = inject('addToast');


    // Functions
    onMounted(() => {
        boxID.value = route.params.boxID as string;
        setHotBarButtons([
            { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
            { icon: '✓', description: 'Create', buttonClass: 'btn-success', onClick: saveItem },
        ]);
    });

    function updateItemName(value: string) {
        itemName.value = value;
    }

    watch(itemName, (newValue) => {
        isSaveDisabled.value = !newValue.trim(); // Disable save button if itemName is empty or whitespace
    });

    async function saveItem() {
    const itemID = Math.random().toString(36).substring(2, 22); // Generate a random 20-character string
    try {
        await client.models.Boxes.create({
        boxID: boxID.value,
        itemID: itemID,
        itemName: itemName.value,
        });
        console.log('Item added:', itemName.value, itemID);
        addToast({
            message: 'Item added successfully!',
            bgClass: 'text-bg-success',
        });
    } catch (error) {
        console.error('Error adding item:', error);
        addToast({
            message: 'Error creating item. Please reload and try again.',
            bgClass: 'text-bg-danger',
        });
    }
    }

    function goBack() {
        router.push(`/box/${boxID.value}`);
    }
</script>

<template>
    <div>
        <div class="mt-5 mb-3 text-center fw-bold fs-3">New item +</div>
        <ItemForm :initialItemName="itemName" @update="updateItemName" />
    </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
