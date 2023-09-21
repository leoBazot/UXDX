<script setup>
import { defineProps, ref, onMounted } from 'vue';
import { getArtistByName } from '../utils/wasabi';

const props = defineProps({
    name: {
        type: String,
        required: true
    }
})

const artistInfo = ref('')

onMounted(async () => {
    const artist = await getArtistByName(props.name)
    artistInfo.value = artist
})

</script>

<template>
    <div class="artistWrapper">
        <h1>{{ name }}</h1>
        <h3>{{ artistInfo.type }}</h3>
    </div>
</template>

<style scoped>
h1 {
    font-weight: 500;
    font-size: 2.6rem;
    position: relative;
    top: -10px;
}
</style>