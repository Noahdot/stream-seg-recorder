import { WaveFile } from 'wavefile';

export const calcAverage = (array, start, count) => {
  if (array instanceof Uint8Array === false) {
    console.error(`${array} is not a Uint8Array`);
    return 0;
  }

  return Array.prototype.reduce.call(array.subarray(start, start + count), (a, b) => a + b, 0) / count;
}

export const debounce = (func, wait) => {
  let timeout;
  return function () {
    const context = this;
    const later = function () {
      timeout = null;
      func.apply(context, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const convertToWav = async (audioBlob) => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const wav = new WaveFile();

  const float32Array = audioBuffer.getChannelData(0);
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    int16Array[i] = float32Array[i] * 0x7FFF;
  }

  wav.fromScratch(audioBuffer.numberOfChannels, audioBuffer.sampleRate, '16', [int16Array]);
  wav.toSampleRate(16000);
  
  const wavBuffer = wav.toBuffer();
  
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
  // console.log((wavBlob.size / 1024 / 1024).toFixed(2) + " MB");

  const reader = new FileReader();
  reader.readAsDataURL(wavBlob);
  return new Promise((resolve) => {
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      resolve(base64data);
    };
  });
};