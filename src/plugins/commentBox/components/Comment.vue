<script setup>
import { ref, toRef, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useFlashNotification } from '@/composables/useFlashNotification';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { signMessage } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();
const auth = getInstance();
const { modalAccountOpen } = useModal();
const props = defineProps({
  placeholder: String,
  buttonName: String,
  item: Object,
  method: String,
  mainThread: String,
  space: Object
});
const { web3Account } = useWeb3();
const item2 = toRef(props, 'item');
const comment = ref(
  props.method === 'edit' && item2.value?.markdown
    ? clone(item2.value?.markdown)
    : ''
);
const loading = ref(false);
const togglePreview = ref(true);
const closeModal = ref(false);
const emit = defineEmits(['dismissComment', 'updateItem', 'replyComment']);
async function postData(url = '', data = {}, authorization) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json;charset=UTF-8',
      ...authorization
    }
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
const { notify } = useFlashNotification();
async function updateItems() {
  if (loading.value) return;
  try {
    loading.value = true;
    const token = localStorage.getItem(
      `_commentBox.token-${web3Account.value}`
    );
    let sig;
    const msg = { markdown: comment.value };
    if (!token)
      sig = await signMessage(
        auth.web3,
        JSON.stringify(msg),
        web3Account.value
      );
    const res = await postData(
      `https://uia5m1.deta.dev/update/${props.item.key}`,
      {
        address: web3Account.value,
        msg: JSON.stringify(msg),
        sig,
        space_id: props.space.id
      },
      token ? { authorization: token } : null
    );
    loading.value = false;
    if (res.refresh) throw new Error('refresh');
    if (!res.status) return notify(['primary', t('comment_box.error')]);
    if (res.token)
      localStorage.setItem(`_commentBox.token-${web3Account.value}`, res.token);
    emit('updateItem', res.data);
    emit('dismissComment');
    closeModal.value = false;

    return;
  } catch (e) {
    if (e.message === 'refresh') {
      localStorage.removeItem(`_commentBox.token-${web3Account.value}`);
      updateItems();
      return;
    }
    loading.value = false;
    notify(['primary', t('comment_box.error')]);
  }
}
const chooseMethod = {
  edit: () => {
    if (!web3Account.value) return (modalAccountOpen.value = true);
    closeModal.value = true;
  },
  replyComment: async function replyComment() {
    if (!web3Account.value) return (modalAccountOpen.value = true);
    if (loading.value) return;
    try {
      loading.value = true;
      const token = localStorage.getItem(
        `_commentBox.token-${web3Account.value}`
      );
      let sig;
      const msg = {
        author: web3Account.value,
        markdown: comment.value,
        proposal_id: props.item.proposal_id,
        main_thread_id: props.mainThread,
        reply_to: props.item.author,
        reply_thread_id: props.item.key,
        reply: props.item.markdown
      };
      if (!token)
        sig = await signMessage(
          auth.web3,
          JSON.stringify(msg),
          web3Account.value
        );
      const res = await postData(
        `https://uia5m1.deta.dev/add_reply`,
        {
          address: web3Account.value,
          msg: JSON.stringify(msg),
          sig
        },
        token ? { authorization: token } : null
      );
      loading.value = false;
      if (res.refresh) throw new Error('refresh');
      if (!res.status) return notify(['primary', t('comment_box.error')]);
      if (res.token)
        localStorage.setItem(
          `_commentBox.token-${web3Account.value}`,
          res.token
        );
      emit('dismissComment');
      emit('replyComment', res.data);
      return;
    } catch (e) {
      if (e.message === 'refresh') {
        localStorage.removeItem(`_commentBox.token-${web3Account.value}`);
        replyComment();
        return;
      }
      loading.value = false;
      notify(['primary', t('comment_box.error')]);
    }
  }
};
function closeEvent() {
  if (loading.value) return;
  closeModal.value = false;
}
watch([closeModal], () => {
  const el = document.body;
  if (!closeModal.value) {
    el.classList['remove']('overflow-hidden');
  } else if (closeModal.value && !el.classList['contains']('overflow-hidden')) {
    el.classList['add']('overflow-hidden');
  }
});
</script>
<template>
  <BaseModal :open="closeModal" @close="closeEvent">
    <template #header>
      <h3>{{ $t('comment_box.edit_comment') }}</h3>
    </template>
    <div class="mt-3 text-center">
      <p>{{ $t('comment_box.edit_modal') }}</p>
    </div>
    <div
      class="mb-2 mt-3 flex content-center items-center justify-center text-center"
    >
      <BaseButton
        class="!bg-primary !text-white"
        :loading="loading"
        @click="updateItems"
        >{{ $t('comment_box.yes') }}</BaseButton
      >
      <BaseButton :disabled="loading" class="ml-2" @click="closeEvent">{{
        $t('comment_box.no')
      }}</BaseButton>
    </div>
  </BaseModal>
  <div class="mt-2">
    <TextareaAutosize
      v-if="togglePreview"
      v-model="comment"
      :placeholder="placeholder"
      class="input w-full text-left"
      :min-height="100"
      style="font-size: 18px"
    />
    <BaseBlock
      v-if="!togglePreview"
      slim="true"
      class="h6 mt-2 mb-0 p-4 text-skin-text"
    >
      <div>{{ comment }}</div>
    </BaseBlock>
    <BaseButton
      :disabled="comment.length === 0"
      :loading="loading"
      class="mt-2"
      primary
      @click="chooseMethod[method]"
    >
      {{ buttonName }}
    </BaseButton>
    <BaseButton
      :disabled="comment.length === 0"
      class="ml-2 mt-2"
      primary
      @click="togglePreview = !togglePreview"
    >
      {{
        togglePreview
          ? $t('comment_box.preview')
          : $t('comment_box.continue_editing')
      }}
    </BaseButton>
    <BaseButton
      :disabled="loading"
      type="text"
      class="button--text ml-2 mt-2 border-0"
      @click="$emit('dismissComment')"
    >
      {{ $t('comment_box.dismiss') }}
    </BaseButton>
  </div>
</template>
