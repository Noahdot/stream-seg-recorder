import { ref, nextTick } from 'vue';
import { useAudioContext } from './composables/useAudioContext';
import { convertToWav, debounce, calcAverage } from './utils';
import Recorder from './classes/recorder';
import { useTransStation } from './composables/useTransStation';

export const useStreamSegRecorder = async (stream) => {
  if (!stream) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } else {
      throw new Error('getUserMedia is not supported');
    }
  }

  // 需要使用者提供的
  // stream, google stt function(這個要怎麼提供比較好啊？)
  // debounce second

  // 先用使用者提供的 stream 來做 init
  // 建立 audioContext, streamSource, analyser, mediaRecorder

  // 要自己寫的 recorder class(可以用composition api嗎？), covertToWav, useTransSation, calcAverage, debounce

  // recordedAudioBase64

  // 可以取得 wav base64 陣列
  // 也可以提供呼叫 google stt 的方法，如果有的話我會 watch 待發陣列，幫你呼叫 stt，然後將返回的字串放進另一個存放 stt 字串的陣列
  const debounceSentenceMs = ref(900);
  const debounceParagraphMs = ref(3000);
  const speechToText = ref(null);

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();

  const setupRecorder = () => {
    Recorder.ins = new MediaRecorder(stream);
    Recorder.ins.ondataavailable = e => Recorder.chunks.push(e.data);
    Recorder.ins.onstop = () => {
      convertToWav(Recorder.chunks[0]).then(base64Url => push(base64Url));
    }
  }

  setupRecorder();

  // const { source, analyser } = useAudioContext(stream);
  // const { recorderIns, recorderStart, recorderStop, recorderStatus } = useRecorder(stream);

  // const init = (stream, { debounceSentenceMs = 900, debounceParagraphMs = 3000 } = {}) => {
  //   debounceSentenceMs.value = debounceSentenceMs;
  //   debounceParagraphMs.value = debounceParagraphMs;
  // }

  const setupOptions = ({
    debounceSentenceMs = 900,
    debounceParagraphMs = 3000,
    speechToText = null
  } = {}) => {
    debounceSentenceMs.value = debounceSentenceMs; // 轉數字
    debounceParagraphMs.value = debounceParagraphMs; // 轉數字
    speechToText.value = speechToText; // 確保是 function
  }

  const run = () => {
    // connect 前要先確保沒有連接？ disconnect 前要確保有連接？
    source.connect(analyser);

    const timeDomainData = new Uint8Array(analyser.fftSize);
    const sampleCount = 10;
    const threshold = 128;

    const debounceSentence = debounce(() => {
      Recorder.stop();
      nextTick(() => Recorder.start());
    }, debounceSentenceMs.value);

    const debounceParagraph = debounce(() => {

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
        }
      }

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const stop = () => {

  }

  return {
    // init,
    setupOptions,
    run,
    stop,

  }
}