# StreamSegRecorder

StreamSegRecorder is an npm package designed to record audio streams, segment the audio based on voice activity, and optionally transcribe the segments using a speech-to-text function. This package is useful for applications that require automatic recording and segmentation of audio input, such as voice assistants or meeting transcription services.

### Features
- Automatic audio segmentation: Records audio when voice is detected and stops recording during silence.
- Customizable silence detection: Configurable time thresholds for determining the end of a sentence and paragraph.
- Speech-to-text integration: Bind a custom speech-to-text function to transcribe audio segments.
- Utility functions: Includes utilities for converting audio blobs to WAV format and calculating average audio amplitude.

### Installation

To install the package, use npm:

```bash
npm install stream-seg-recorder
```

### Usage

Below is an example of how to use the StreamSegRecorder package in a **Vue 3** application:

```javascript
import { useStreamSegRecorder } from 'stream-seg-recorder';

// Get the audio stream from user's microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const { setupOptions, recordingStart, recordingStop, transList } = useStreamSegRecorder(stream);

    // Setup options for the recorder
    setupOptions({
      debounceSentenceMs: 900,
      debounceParagraphMs: 3000,
      speechToText: async (base64Audio) => {
        // Your speech-to-text function
        return { data: { transcript: 'transcribed text', order: 0 } };
      }
    });

    // Start recording
    recordingStart();

    // Stop recording after some time
    setTimeout(() => {
      recordingStop();
      console.log(transList.value);
    }, 10000);
  })
  .catch(error => {
    console.error('Error accessing media devices.', error);
  });
```

Below is an example of how to use the StreamSegRecorder package in a **Vue 2** application:

```javascript
import { useStreamSegRecorder } from 'stream-auto-segment';
import axios from 'axios';

export default {
  data() {
    return {
      transList: [],
      recorder: null
    };
  },
  created() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.setupRecorder(stream);
      })
      .catch(console.error);
  },
  methods: {
    setupRecorder(stream) {
      const { setupOptions, recordingStart, recordingStop, transList } = useStreamSegRecorder(stream);

      this.transList = transList;

      setupOptions({
        debounceSentenceMs: 900,
        debounceParagraphMs: 3000,
        speechToText
      });

      recordingStart();

      setTimeout(() => {
        recordingStop();
        console.log(this.transList);
      }, 10000);
    }
  },
  watch: {
    transList: {
      handler(newList) {
        console.log('Transcription updated:', newList);
      },
      deep: true
    }
  }
};
```

### Other sample code
Frontend function for processing speech-to-text
```javascript
export const speechToText = ({ time, order, base64Url }) => {
  const formData = new FormData();
  formData.append('time', time);
  formData.append('order', order);
  formData.append('content', base64Url);

  return axios.post(sttUrl, formData);
};
```

Backend function for processing speech-to-text
```javascript
// Note: Need to install Multer for handling file uploads
const multer = require('multer');
const upload = multer({
  limits: { 
    fileSize: 10 * 1024 * 1024,
    fieldSize: 10 * 1024 * 1024
  }
});
app.post('/api/google/stt', upload.any(), async (req, res) => {
  const { time, order, content } = req.body;

  const url = `https://speech.googleapis.com/v1/speech:recognize?key=${yourApiKey}`;

  const audio = {
    content
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'cmn-Hant-TW',
    alternativeLanguageCodes: ['cmn-Hant-TW', 'en-US'],
  };

  try {
    const { data } = await axios.post(url, { audio, config });
    const transcript = data?.results?.[0]?.alternatives?.[0]?.transcript;
    const languageCode = data?.results?.[0]?.languageCode;

    res.json({ time, transcript, languageCode, order });
  } catch (error) {
    res.json({ transcript: undefined });
  }
});
```

### API

#### useStreamSegRecorder(stream)

Parameters
- `stream`: The audio stream obtained from the user's microphone or other audio source.

Returns
- `setupOptions(options)`: Configures the recorder settings.
  - `debounceSentenceMs`: Number of milliseconds of silence to consider as the end of a sentence.
  - `debounceParagraphMs`: Number of milliseconds of silence to consider as the end of a paragraph.
  - `speechToText`: A function that takes base64 encoded audio and returns a transcription.
- `recordingStart()`: Starts the recording process.
- `recordingStop()`: Stops the recording process.
- `transList`: A reactive list of transcribed text segments.

