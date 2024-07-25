<script setup lang="ts">
    // Imports
    import { ref, onMounted, watch } from 'vue';
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

    // Functions
    onMounted(() => {
        boxID.value = route.params.boxID as string;
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
    } catch (error) {
        console.error('Error adding item:', error);
    }
    }

    function goBack() {
        router.push(`/box/${boxID.value}`);
    }
</script>

<template>
    <div>
        <ItemForm :initialItemName="itemName" @update="updateItemName" />
        <button @click="goBack">Back</button>
        <button @click="saveItem" :disabled="isSaveDisabled">Save</button>
    </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
