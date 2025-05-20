export class AudibleMetronome {
    private audioContext: AudioContext | null = null;
    private intervalId: any = null;
    private currentTickCount = 0;
    private targetTicks = 0;
    private bpm = 0;
    private beatsPerMeasure: number = 4;
    private onTickVisualCallback?: (currentTick: number) => void;
    private onFinished?: () => void;

    constructor() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            this.audioContext = null;
        }
    }

    private playTickSound(isAccentedBeat: boolean = false): void {
        if (!this.audioContext || this.audioContext.state !== 'running') {
            console.warn("AudioContext nicht verfügbar oder nicht im 'running' state. Es wird kein Ton abgespielt.");
            return;
        }

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // --- Parameter for Metronome-Click ---

        let clickFrequency = 1000; 
        let initialGain = 0.3;    // Volume
        const clickDuration = 0.05; 
        const attackTime = 0.001;   // How fast the click reaches maximum volume
        const decayTime = 0.04;     // How fast the click fades

        oscillator.type = 'square'; 

        if (isAccentedBeat) {
            clickFrequency = 1500; // Higher frequency for the accented, first beat
        }

        oscillator.frequency.setValueAtTime(clickFrequency, now);

        // start at 0 to reduce noices while starting the occilator
        gainNode.gain.setValueAtTime(0, now);
        // quickly raise value
        gainNode.gain.linearRampToValueAtTime(initialGain, now + attackTime);
        // quickly fade
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime);

        // Play
        oscillator.start(now);
        oscillator.stop(now + clickDuration);
    }

    public start(
        bpm: number,
        totalTicks: number,
        onTickVisualCallback?: (currentTick: number) => void,
        onFinished?: () => void,
        beatsPerMeasure: number = 4,
    ): boolean {
        if (this.isRunning()) {
            console.warn("Metronom läuft bereits. Bitte zuerst stoppen.");
            return false;
        }
        if (bpm <= 0) {
            console.error("BPM muss positiv sein.");
            return false;
        }
        if (totalTicks <= 0 && totalTicks !== Infinity) {
            console.error("totalTicks muss positiv sein oder Infinity.");
            return false;
        }
        if (!this.audioContext) {
            console.error("Kann Metronom nicht starten, da AudioContext nicht initialisiert werden konnte.");
            return false;
        }

        this.beatsPerMeasure = beatsPerMeasure > 0 ? beatsPerMeasure : 0; // 0 for no accent
        this.onTickVisualCallback = onTickVisualCallback;
        this.onFinished = onFinished;
        this.bpm = bpm;
        this.targetTicks = totalTicks;
        this.currentTickCount = 0;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed successfully.');
                this.proceedWithStart();
            }).catch(err => {
                console.error('Error resuming AudioContext:', err);
            });
            return true; // asynchronus
        } else {
            this.proceedWithStart();
            return true;
        }
    }

    private proceedWithStart(): void {
        const intervalMilliseconds = (60 / this.bpm) * 1000;

        const tick = () => {
            this.currentTickCount++;

            if (this.currentTickCount <= this.targetTicks){
                const isFirstBeat = this.beatsPerMeasure > 0 ? (this.currentTickCount - 1) % this.beatsPerMeasure === 0 : false;
                this.playTickSound(isFirstBeat); 

                if (this.onTickVisualCallback) {
                    this.onTickVisualCallback(this.currentTickCount);
                }
            }

            // last tick is to stop the metronome
            if (this.currentTickCount > this.targetTicks) {
                this.stop();
                console.log("Hörbares Metronom beendet nach", this.targetTicks, "Ticks.");
            }
        };

        this.intervalId = setInterval(tick, intervalMilliseconds);
        console.log(`Hörbares Metronom gestartet: ${this.bpm} BPM, Ziel: ${this.targetTicks} Ticks, Intervall: ${intervalMilliseconds.toFixed(2)}ms`);
    }

    public stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log("Hörbares Metronom gestoppt.");
        }
        if (this.onFinished) {
            this.onFinished();
        }
    }

    public isRunning(): boolean {
        return this.intervalId !== null;
    }
}
