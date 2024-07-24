<script setup lang="ts">
    // Imports
    import { useRouter } from 'vue-router';

    // Vars
    const router = useRouter();
    
    // Functions
    function returnHome() {
        router.push('/');
    }
</script>

<template>
    <main>
        <h1>🛟 You're Lost</h1>
        <p>Sorry, but that item couldn't be found. It may have been re-assigned or deleted.</p>
        <button @click="returnHome">Return Home</button>
    </main>
</template>