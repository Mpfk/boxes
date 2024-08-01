<template>
    <button :class="['circle', 'btn', buttonClass]">
      <div class="circle-icon">{{ icon }}</div>
      <div class="circle-description">{{ description }}</div>
    </button>
  </template>
  
  <script>
    export default {
        name: "CircleButton",
        props: {
          icon: {
              type: String,
              required: true,
          },
          description: {
              type: String,
              required: true,
          },
          buttonClass: {
              type: String,
              default: "btn-dark",
          },
        },
    };
  </script>
  
  <style scoped>
        .circle {
        margin: 0.25em;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 50% !important;
        border: none !important;
        padding: 1em !important;
        font-size: 1em !important;
        font-weight: 500 !important;
        font-family: inherit !important;
        cursor: pointer !important;
        transition: background-color 0.25s !important;
        outline: none !important;
        width: 3em !important;
        height: 3em !important;
        }

        .circle-icon {
        margin-bottom: 0em;
        }

        .circle-description {
        font-size: 0.5em;
        }
  </style>