import { ref, computed } from 'vue';

export const useTransStation = () => {
  const transList = ref([]);
  const pendingRequest = ref([]);
  const pendingResponse = ref([]);
  const requestOrder = ref(0);
  const newParagraph = ref(false);
  
  const push = (base64Url) => {
    pendingRequest.value.push({
      time: Date.now(),
      order: requestOrder.value,
      base64Url
    });
    requestOrder.value++;
  }

  const updateTransList = () => {
    const lastTrans = transList.value[transList.value.length - 1];
    if (newParagraph.value) {
      transList.value.push(transItem.value);
      newParagraph.value = false;
    } else {
      lastTrans = transItem.value;
    }
  }

  watch(pendingRequest, (value) => {
    if (value.length > 0) {
      if (hasBindStt.value) {
        sttFunc.value(value[0]).then(({ data }) => {
          const { time, order, transcript } = data;
          pendingResponse.value.push({ time, order, transcript });
        }).catch(err => console.log(err));
      } else {
        const { time, order, base64Url: transcript } = value[0];
        pendingResponse.value.push({ time, order, transcript });
      }

      value.length--;
    }
  }, { deep: true });

  watch(newParagraph, (value) => {
    if (value) reset();
  });

  watch(pendingResponse, (value) => {
    if (value.length > 0) updateTransList();
  }, { deep: true });

  const reset = () => {
    pendingRequest.value.length = 0;
    pendingResponse.value.length = 0;
    requestOrder.value = 0;
  }

  const sttFunc = ref(null);
  const hasBindStt = computed(() => sttFunc.value !== null);

  const bindStt = (func) => {
    sttFunc.value = func;
  }

  const transItem = computed(() => {
    return pendingResponse.value.sort((a, b) => a.order - b.order).map(item => ({ time: item.time, content: item.transcript }));
  });

  return {
    newParagraph,
    push,
    transList,
    bindStt
  }
}