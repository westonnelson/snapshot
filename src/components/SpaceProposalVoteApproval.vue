<script setup>
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';

defineProps({
  proposal: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref([]);

function selectChoice(i) {
  if (selectedChoices.value.includes(i))
    selectedChoices.value.splice(selectedChoices.value.indexOf(i), 1);
  else selectedChoices.value.push(i);

  emit('selectChoice', selectedChoices.value);
}
</script>

<template>
  <div class="mb-3">
    <BaseButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      class="mb-2 block w-full"
      :class="{
        '!border-skin-link': selectedChoices.includes(i + 1),
        'border-skin-border hover:border-skin-link': !selectedChoices.includes(
          i + 1
        )
      }"
      @click="selectChoice(i + 1)"
    >
      {{ shorten(choice, 32) }}
    </BaseButton>
  </div>
</template>
