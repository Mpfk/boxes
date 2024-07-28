<script setup lang="ts">
    // Imports
    import { ref, onMounted, watch, inject } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import ItemForm from './ItemForm.vue';
    import { generateClient } from 'aws-amplify/data';
    import type { Schema } from '../../amplify/data/resource';

    // Interfaces
    interface HotBarButton {
        icon: string;
        description: string;
        buttonClass: string;
        onClick: () => void;
    }

    interface ToastOptions {
        message: string;
        bgClass: string;
    }

    // Vars
    const route = useRoute();
    const router = useRouter();
    const client = generateClient<Schema>();
    const boxID = ref('');
    const itemName = ref('');
    const quantity = ref(0);
    const note = ref('');

    const isSaveDisabled = ref(true);

    const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;
    const addToast = inject<(options: ToastOptions) => void>('addToast')!;

    // Functions
    onMounted(() => {
        boxID.value = route.params.boxID as string;
        setHotBarButtons([
            { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
            { icon: '✓', description: 'Create', buttonClass: 'btn-success', onClick: saveItem },
        ]);
    });

    watch(itemName, (newValue) => {
        isSaveDisabled.value = !newValue.trim();
    });

    function updateItemName(value: string) {
    itemName.value = value;
    }

    function updateQuantity(value: number) {
    quantity.value = value;
    }

    function updateNote(value: string) {
    note.value = value;
    }

    async function saveItem() {
        const itemID = Math.random().toString(36).substring(2, 22); // Generate a random 20-character string
        try {
            await client.models.Boxes.create({
                boxID: boxID.value,
                itemID: itemID,
                itemName: itemName.value,
                quantity: quantity.value,
                note: note.value,
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
            <ItemForm :initialItemName="itemName" :initialQuantity="quantity" :initialNote="note" @update="({ itemName, quantity, note }) => { updateItemName(itemName); updateQuantity(quantity); updateNote(note); }" />
        </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
