import { ref } from 'vue';
import { convertToWav } from '../utils';
import { useTransStation } from '@composables/useTransStation.js';

export const useRecorder = (stream) => {
  const { push, check, transList, fetchConsultAI, fetchAudioContent } = useTransStation();
  const chunks = [];
  const ins = new MediaRecorder(stream);
  ins.ondataavailable = e => chunks.push(e.data);
  ins.onstop = () => {
    convertToWav(chunks[0]).then(base64Url => push(base64Url));
  }

  return {

  }
}