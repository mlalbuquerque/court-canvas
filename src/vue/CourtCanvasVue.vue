<template>
  <div 
    :id="uniqueId" 
    class="court-canvas-vue-container" 
    tabindex="0" 
    style="outline: none;"
  ></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import CourtCanvas from '../core/CourtCanvas.js';
import JsonExporter from '../core/Exporters/JsonExporter.js';
import ImageExporter from '../core/Exporters/ImageExporter.js';

const props = defineProps({
  width: { type: Number, default: 800 },
  height: { type: Number, default: 500 },
  backgroundColor: { type: String, default: '#2ecc71' },
  lineColor: { type: String, default: '#ffffff' }
});

const emit = defineEmits(['ready']);

const uniqueId = ref(`court-vue-${Math.random().toString(36).substr(2, 9)}`);
let courtInstance = null;

onMounted(() => {
  courtInstance = new CourtCanvas(uniqueId.value, {
    width: props.width,
    height: props.height,
    backgroundColor: props.backgroundColor,
    lineColor: props.lineColor
  });

  courtInstance.jsonExporter = new JsonExporter(courtInstance);
  courtInstance.imageExporter = new ImageExporter(courtInstance);

  emit('ready', courtInstance);
});

onBeforeUnmount(() => {
  if (courtInstance && courtInstance.stage) {
    courtInstance.stage.destroy();
  }
});
</script>
