<script setup>
import Artist from './components/Artist.vue'
import SearchArtist from './components/SearchArtist.vue';
</script>

<template>
    <header>
        <div class="wrapper">
            <SearchArtist />
        </div>
    </header>
    <main>
        <Artist name="Imagine Dragon" />
    </main>
</template>

<!-- <style scoped>
header {
    line-height: 1.5;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        justify-content: center;
        align-items: center;
        /* place-items: center; */
        /* padding-right: calc(var(--section-gap) / 2); */
    }

    /* .wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 2rem 0;
    } */

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}
</style>
 -->