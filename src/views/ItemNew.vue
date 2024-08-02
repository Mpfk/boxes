<script setup lang="ts">
    // Imports
    import { ref, onMounted, watch, inject } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import ItemForm from '../components/ItemForm.vue';
    import { generateClient } from 'aws-amplify/data';
    import type { Schema } from '../../amplify/data/resource';
    import confetti from 'canvas-confetti';

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

    interface UpdateEvent {
        itemName: string;
        quantity: number;
        note: string;
    }

    // Vars
    const route = useRoute();
    const router = useRouter();
    const client = generateClient<Schema>();
    const boxID = ref('');
    const itemName = ref('');
    const quantity = ref(1);
    const note = ref('');
    const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;
    const addToast = inject<(options: ToastOptions) => void>('addToast')!;
    const animate = ref(false);

    // Functions
    onMounted(() => {
        boxID.value = route.params.boxID as string;
        setHotBarButtons([
            { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
            { icon: '✓', description: 'Create', buttonClass: 'btn-secondary', onClick: warnRequires },
        ]);
    });

    watch(itemName, (newValue) => {
        if(newValue.trim().length > 0) {
            setHotBarButtons([
                { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
                { icon: '✓', description: 'Create', buttonClass: 'btn-success', onClick: saveItem },
            ]);
        } else {
            setHotBarButtons([
                { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
                { icon: '✓', description: 'Create', buttonClass: 'btn-secondary', onClick: warnRequires },
            ]);
        }
    });

    function warnRequires() {
        addToast({
            message: 'Missing required values.',
            bgClass: 'text-bg-warning',
        });
    }

    function updateItemName(value: string) {
        itemName.value = value;
    }

    function updateQuantity(value: number) {
        quantity.value = value;
    }

    function updateNote(value: string) {
        note.value = value;
    }

    function resetForm() {
        itemName.value = '';
        quantity.value = 1;
        note.value = '';
        itemName.value = '';
        quantity.value = 1;
        note.value = '';
    }

    function animateNextItem() {
        animate.value = true;
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#198754', '#157347'],
        });
        resetForm();
        setTimeout(() => {
            animate.value = false;
        }, 3500);
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
            animateNextItem();
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
        <div class="mt-5 mb-3 text-center fw-bold fs-3">Add items +</div>
        <ItemForm 
            v-if="!animate"
            :initialItemName="itemName" 
            :initialQuantity="quantity" 
            :initialNote="note" 
            @update="({ itemName, quantity, note }: UpdateEvent) => { 
                updateItemName(itemName); 
                updateQuantity(quantity); 
                updateNote(note); 
            }" 
        />
        <div v-if="animate" class="text-center mt-5 text-success">
            <div class="fw-bold" style="font-size: 4em;">✓</div>
            <p>Item added!</p>
            <p class="mt-5 text-muted">Resetting form...</p>
        </div>
    </div>
</template>

<style scoped></style>