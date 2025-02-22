<script setup lang="ts">
import { ref } from 'vue';
import { useImageUpload } from '@/composables/useImageUpload';

defineProps<{
  avatar?: string;
}>();

const emit = defineEmits(['image-uploaded', 'image-remove']);

const fileInput = ref<HTMLInputElement | null>(null);

function openFilePicker() {
  fileInput.value?.click();
}

const uploadSuccess = ref(false);
const previewFile = ref<File | undefined>(undefined);

const { upload, isUploadingImage } = useImageUpload();

function onFileChange(e) {
  uploadSuccess.value = false;
  previewFile.value = (e.target as HTMLInputElement).files?.[0];
  upload(previewFile.value, image => {
    uploadSuccess.value = true;
    emit('image-uploaded', image.url);
  });
}

function handleSelect(e): void {
  if (e === 'change') openFilePicker();
  else if (e === 'remove') {
    emit('image-remove');
    previewFile.value = undefined;
  }
}
</script>

<template>
  <div @click="avatar ? null : openFilePicker()">
    <BaseDropdown
      :items="[
        { text: $t('profile.settings.change'), action: 'change' },
        { text: $t('profile.settings.remove'), action: 'remove' }
      ]"
      @select="handleSelect"
    >
      <template #button>
        <slot
          name="avatar"
          :uploading="isUploadingImage"
          :previewFile="uploadSuccess ? previewFile : undefined"
        />
      </template>
    </BaseDropdown>
  </div>
  <input
    v-bind="$attrs"
    ref="fileInput"
    type="file"
    accept="image/jpg, image/jpeg, image/png"
    style="display: none"
    @change="onFileChange"
  />
</template>
