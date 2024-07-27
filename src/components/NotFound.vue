<script setup lang="ts">
    // Imports
    import { onMounted, inject } from 'vue';
    import { useRouter } from 'vue-router';

    // Interface
    interface HotBarButton {
        icon: string;
        description: string;
        buttonClass: string;
        onClick: () => void;
    }

    // Vars
    const router = useRouter();
    const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;

    // Functions
    function returnHome() {
        router.push('/');
    }

    onMounted(() => {
        setHotBarButtons([
            { icon: '⌂', description: 'Home', buttonClass: 'btn-warning', onClick: returnHome }
        ]);
    });
</script>

<template>
    <main>
        <div class="mt-5">
            <h1>🛟 You're Lost</h1>
            <p>Sorry, but that item couldn't be found. It may have been re-assigned or deleted.</p>
        </div>
    </main>
</template>
