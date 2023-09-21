<template>
    <form>
        <input type="text" placeholder="Search for an artist" />
    </form>
</template>
<style scoped>
input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--color-border, #ff0000);
    border-radius: 8px;
    font-size: 1.2rem;
    color: #414141;
    /* padding-right: 10rem; */
    margin-right: 1rem;
}

input:focus {
    outline: none;
    border-color: #000;
}
</style>