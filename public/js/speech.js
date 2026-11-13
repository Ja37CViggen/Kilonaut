/**
 * Kilonaut: Space Science Mission Control & Academy
 * Speech Engine (Web Speech API) - Tuned for a friendly, energetic ~13-year-old kid astronaut voice.
 */

class CosmicSpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.isSpeaking = false;
    this.recognition = null;
    this.isListening = false;
    this.onStateChange = null;

    if (this.synth) {
      this.loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }

    this.initRecognition();
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
  }

  getBestVoice(lang) {
    if (!this.voices.length) this.loadVoices();
    const prefix = lang === 'ar' ? 'ar' : 'en';

    const langVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith(prefix));
    if (!langVoices.length && lang === 'en') {
      return this.voices.find(v => v.lang.toLowerCase().includes('en')) || null;
    }

    // Prefer youthful, natural, friendly voices (Samantha, Jenny, Zira, Google UK Female, Laila, Zeina, etc.)
    const preferredYouthNames = ['natural', 'samantha', 'jenny', 'zira', 'female', 'laila', 'zeina', 'salma', 'maged', 'child', 'kid'];
    const youthVoice = langVoices.find(v => {
      const nameLower = v.name.toLowerCase();
      return preferredYouthNames.some(p => nameLower.includes(p));
    });

    return youthVoice || langVoices[0] || null;
  }

  speak(text, lang = 'en', onEndCallback = null) {
    if (!this.synth) {
      if (onEndCallback) onEndCallback();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

    // Tuned specifically to sound like a friendly, bright ~13-year-old companion
    utterance.pitch = 1.25; 
    utterance.rate = lang === 'ar' ? 1.00 : 1.05;

    const bestVoice = this.getBestVoice(lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    this.isSpeaking = true;
    if (this.onStateChange) this.onStateChange(true);

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false);
      if (onEndCallback) onEndCallback();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth && (this.synth.speaking || this.synth.pending)) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    if (this.onStateChange) this.onStateChange(false);
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    } catch (e) {
      console.warn('Speech recognition unavailable:', e);
    }
  }

  listen(lang = 'en', onResult, onError) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    this.stop();
    this.recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    this.isListening = true;

    this.recognition.onresult = (event) => {
      this.isListening = false;
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

window.cosmicSpeech = new CosmicSpeechEngine();
