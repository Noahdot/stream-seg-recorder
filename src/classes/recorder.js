class Recorder {
  constructor() {
    this.ins = null;
    this.chunks = [];
  }

  start() {
    if (!this.ins) return;

    this.chunks = [];
    this.ins.start();
  }

  stop() {
    if (!this.ins) return;

    this.ins.stop();
  }

  isRecording() {
    return this.ins.state === 'recording';
  }
}

export default new Recorder();