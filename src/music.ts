export class AudioPlayer {
    private audioContext: AudioContext;
    private audioBuffer: AudioBuffer | null = null;
    private analyser: AnalyserNode;
    private dataArray!: Uint8Array;
    private bufferLength!: number;

    constructor() {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
    }

    async loadAudio(url: string) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    }

    play() {
        if (this.audioBuffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffer;
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.analyser.fftSize = 512;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            source.start(0);
        } else {
            console.error('Audio not loaded');
        }
    }

    avg(arr: Uint8Array) {
        var total = arr.reduce(function (sum, b) {
            return sum + b;
        });
        return (total / arr.length);
    }

    max(arr: Uint8Array) {
        return arr.reduce(function (a, b) {
            return Math.max(a, b);
        })
    }

    getMaxFreq() {
        if (!this.dataArray) return [0, 0];
        this.analyser.getByteFrequencyData(this.dataArray);
        let lowerHalfArray = this.dataArray.slice(0, (this.dataArray.length / 2) - 1);
        let upperHalfArray = this.dataArray.slice((this.dataArray.length / 2) - 1, this.dataArray.length - 1);

        let lowerMax = this.max(lowerHalfArray);
        let upperMax = this.max(upperHalfArray);

        let lowerMaxFr = lowerMax / lowerHalfArray.length;
        let upperMaxFr = upperMax / upperHalfArray.length;

        return [lowerMaxFr, upperMaxFr];
    }

    getHighPitches() {
        // Get the FFT data
        this.analyser.getByteFrequencyData(this.dataArray);

        // Here we're only interested in the high frequencies, so let's say above 10000 Hz.
        // Each bin in the FFT data corresponds to a frequency range of approximately
        // (sampleRate / fftSize), so to get the index corresponding to 10000 Hz:
        var index = Math.round(10000 / (this.audioContext.sampleRate / this.analyser.fftSize));

        // Now we can loop over the FFT data from this index onwards to detect high pitches
        for (let i = index; i < this.bufferLength; i++) {
            if (this.dataArray[i] > 0) {
                console.log(`Detected high pitch at frequency ${i * this.audioContext.sampleRate / this.analyser.fftSize} Hz`);
            }
        }
    }
}