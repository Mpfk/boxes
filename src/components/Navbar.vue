<template>
    <nav class="navbar fixed-top navbar-expanded-md bg-body-tertiary">
        <div class="col-1 col-md-4 text-start">
            <div class="d-inline-block">
                <CircleButton icon="⚙" description="Options" buttonClass="btn-dark" v-if="$route.path !== '/options'" @click="$router.push('/options')" />
            </div>
        </div>
        <div class="col-10 col-md-4 text-center title">📦 Boxes</div>
        <div class="col-1 col-md-4 text-end"></div>
    </nav>
</template>

<script>
import CircleButton from "@/components/CircleButton.vue";

export default {
    name: 'Navbar',
    components: {
        CircleButton,
    },
}
</script>

<style scoped>
    .title {
        font-size: 1.75em;
        font-weight: 600;
    }
</style>