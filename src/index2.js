

class StreamSegRecorder {
  constructor(stream, {
    debounceSentenceMs = 900,
    debounceParagraphMs = 3000
  } = {}) {
    this.stream = stream;
    this.debounceSentenceMs = debounceSentenceMs;
    this.debounceParagraphMs = debounceParagraphMs;
    this.audioBase64List = []; // 存放 wav base64 list / stt string list
  }

  run() {

  }

  stop() {

  }

  fetchTransList() {
    return this.audioBase64List;
  }
}

export default StreamSegRecorder;

// const recorder = new StreamSegRecorder(stream);

