import { ref, nextTick } from 'vue';
import { convertToWav, debounce, calcAverage } from './utils';
import Recorder from './classes/recorder';
import { useTransStation } from './composables/useTransStation';

const { newParagraph, push, transList, bindStt } = useTransStation();
const lastSentence = ref(false);
const isConnecting = ref(false);

export const useStreamSegRecorder = async (stream) => {
  if (!stream) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } else {
      throw new Error('getUserMedia is not supported');
    }
  }
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  const setupRecorder = () => {
    Recorder.ins = new MediaRecorder(stream);
    Recorder.ins.ondataavailable = e => Recorder.chunks.push(e.data);
    Recorder.ins.onstop = () => {
      if (lastSentence.value === true) return;
      convertToWav(Recorder.chunks[0]).then(base64Url => push(base64Url));
    }
  }
  setupRecorder();

  // options setup
  const debounceSentenceMs = ref(900);
  const debounceParagraphMs = ref(3000);
  const speechToText = ref(null);

  const setupOptions = ({
    debounceSentenceMs = 900,
    debounceParagraphMs = 3000,
    speechToText = null
  } = {}) => {
    debounceSentenceMs.value = Number(debounceSentenceMs);
    debounceParagraphMs.value = Number(debounceParagraphMs);
    speechToText.value = typeof speechToText === 'function'? speechToText: null;
    if (speechToText.value) bindStt(speechToText.value);
  }

  const recordingStart = () => {
    connect();

    const timeDomainData = new Uint8Array(analyser.fftSize);
    const sampleCount = 10;
    const threshold = 128;

    const debounceSentence = debounce(() => {
      Recorder.stop();
      nextTick(() => Recorder.start());
    }, debounceSentenceMs.value);

    const debounceParagraph = debounce(() => {
      lastSentence.value = true;
      Recorder.stop();
    }, debounceParagraphMs.value);

    const update = () => {
      analyser.getByteTimeDomainData(timeDomainData);
      const average = calcAverage(timeDomainData, 0, sampleCount);
      if (average > threshold) {
        if (Recorder.isRecording()) {
          debounceSentence();
          debounceParagraph();
        } else {
          Recorder.start();
          newParagraph.value = true;
        }
      }

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const recordingStop = () => {
    disconnect();
  }

  const connect = () => {
    source.connect(analyser);
    isConnecting.value = true;
  }

  const disconnect = () => {
    if (isConnecting.value) {
      source.disconnect(analyser);
      isConnecting.value = false;
    }
  }

  return {
    setupOptions,
    recordingStart,
    recordingStop,
    transList
  }
}