<template>
  <div class="loader mr-5">
  </div>
</template>
<style scoped>
.loader {
  width: 20px;
  height: 20px;
  border: 2.5px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
