export class VoiceService {
  static isSupported() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  static startListening(onResult, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError('Speech Recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Voice input started');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult(transcript.toLowerCase());
    };

    recognition.onerror = (event) => {
      onError(event.error);
    };

    recognition.onend = () => {
      console.log('Voice input ended');
    };

    recognition.start();
    return recognition;
  }

  static parseSymptomCommand(transcript) {
    // Examples: "log symptoms: cramps, fatigue, headache"
    // Or: "cramps and fatigue"
    
    const symptoms = [
      'cramps', 'headache', 'bloating', 'fatigue', 'back pain', 'nausea',
      'acne', 'breast tenderness', 'mood swings', 'anxiety', 'irritability',
      'sadness', 'cravings', 'insomnia', 'low energy'
    ];

    const found = [];
    symptoms.forEach(symptom => {
      if (transcript.includes(symptom)) {
        found.push(symptom);
      }
    });

    return found;
  }

  static parseSeverityCommand(transcript) {
    // Examples: "rate cramps 7 out of 10" or "severity 5"
    const numbers = transcript.match(/\d+/g);
    if (numbers) {
      const severity = parseInt(numbers[0]);
      return Math.min(Math.max(severity, 1), 10);
    }
    return null;
  }

  static parseCommand(transcript) {
    const command = {
      type: null,
      symptoms: [],
      severity: null,
      trigger: null,
    };

    // Check command type
    if (transcript.includes('log symptoms') || transcript.includes('add symptoms')) {
      command.type = 'log_symptoms';
      command.symptoms = this.parseSymptomCommand(transcript);
    } else if (transcript.includes('severity') || transcript.includes('rate')) {
      command.type = 'set_severity';
      command.severity = this.parseSeverityCommand(transcript);
    } else if (transcript.includes('stress') || transcript.includes('food') || transcript.includes('exercise')) {
      command.type = 'set_trigger';
      if (transcript.includes('stress')) command.trigger = 'stress';
      else if (transcript.includes('food')) command.trigger = 'food';
      else if (transcript.includes('exercise')) command.trigger = 'exercise';
    }

    return command;
  }
}
