import { useStreamSegRecorder } from 'xxx';
import { speechToText } from 'yyy';

// 1
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const { run, stop, setupOptions, fetchTransList } = useStreamSegRecorder(stream);
  const options = {
    debounceSentenceMs: 900,
    debounceParagraphMs: 3000,
    speechToText
  };
  setupOptions(options);
})

// 2
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const { run, stop, setupOptions, fetchTransList } = useStreamSegRecorder(stream);
const options = {
  debounceSentenceMs: 900,
  debounceParagraphMs: 3000,
  speechToText
};
setupOptions(options);