const InstrumentEnum = {
	BONGO: 0,
	KEYBOARD: 1,
	MEOW: 3,
	CYMBAL: 4,
	MARIMBA: 5,
};
const KeyEnum = {
	'A': 1,
	'D': 0,
	'1': 'C4',
	'2': 'C#4',
	'3': 'D4',
	'4': 'D#4',
	'5': 'E4',
	'6': 'F4',
	'7': 'F#4',
	'8': 'G4',
	'9': 'G#4',
	'0': 'A4',
	' ': 0,
	'C': 1,
	'Q': 'C4',
	'W': 'C#4',
	'E': 'D4',
	'R': 'D#4',
	'T': 'E4',
	'Y': 'F4',
	'Z': 'F4',
	'U': 'F#4',
	'I': 'G4',
	'O': 'G#4',
	'P': 'A4',
};
const InstrumentPerKeyEnum = {
	'A': InstrumentEnum.BONGO,
	'D': InstrumentEnum.BONGO,
	'1': InstrumentEnum.KEYBOARD,
	'2': InstrumentEnum.KEYBOARD,
	'3': InstrumentEnum.KEYBOARD,
	'4': InstrumentEnum.KEYBOARD,
	'5': InstrumentEnum.KEYBOARD,
	'6': InstrumentEnum.KEYBOARD,
	'7': InstrumentEnum.KEYBOARD,
	'8': InstrumentEnum.KEYBOARD,
	'9': InstrumentEnum.KEYBOARD,
	'0': InstrumentEnum.KEYBOARD,
	' ': InstrumentEnum.MEOW,
	'C': InstrumentEnum.CYMBAL,
	'Q': InstrumentEnum.MARIMBA,
	'W': InstrumentEnum.MARIMBA,
	'E': InstrumentEnum.MARIMBA,
	'R': InstrumentEnum.MARIMBA,
	'T': InstrumentEnum.MARIMBA,
	'Y': InstrumentEnum.MARIMBA,
	'Z': InstrumentEnum.MARIMBA,
	'U': InstrumentEnum.MARIMBA,
	'I': InstrumentEnum.MARIMBA,
	'O': InstrumentEnum.MARIMBA,
	'P': InstrumentEnum.MARIMBA,
};
const ClickKeyEquivalentEnum = {
	'1': 'A',
	'2': ' ',
	'3': 'D',
};
let pressed = [];

$.bindMidiInput = function(inputDevice) {
	console.log('Midi input device connected');

	WebMidi.addListener('disconnected', (device) => {
		if (device.input) {
			device.input.removeListener('noteon');
			device.input.removeListener('noteoff');
			console.log('Midi input device disconnected');
		}
	});
	inputDevice.addListener('noteon', 'all', (event) => {
		console.log('noteon', event.note.number);
		$.play(InstrumentEnum.KEYBOARD, event.note.name + event.note.octave, true);
	});
	inputDevice.addListener('noteoff', 'all', (event) => {
		console.log('noteoff');
		samples.KEYBOARD.triggerRelease(event.note.number);
		$.play(InstrumentEnum.KEYBOARD, event.note.name + event.note.octave, false);
	});

	inputDevice.addListener('controlchange', 'all', (event) => {
		if (event.controller.name === 'holdpedal') {
			// this.emit(event.value ? 'pedalDown' : 'pedalUp');
		}
	});
};

const SampleMapping = {
	KEYBOARD: {
		'C4' : 'keyboard1.wav',
		'C#4': 'keyboard2.wav',
		'D4' : 'keyboard3.wav',
		'D#4': 'keyboard4.wav',
		'E4' : 'keyboard5.wav',
		'F4' : 'keyboard6.wav',
		'F#4': 'keyboard7.wav',
		'G4' : 'keyboard8.wav',
		'G#4': 'keyboard9.wav',
		'A4' : 'keyboard0.wav',
	},

	MARIMBA: {
		'C4' : 'marimba1.wav',
		'C#4': 'marimba2.wav',
		'D4' : 'marimba3.wav',
		'D#4': 'marimba4.wav',
		'E4' : 'marimba5.wav',
		'F4' : 'marimba6.wav',
		'F#4': 'marimba7.wav',
		'G4' : 'marimba8.wav',
		'G#4': 'marimba9.wav',
		'A4' : 'marimba0.wav',
	},

	BONGO: {
		0: 'bongo0.wav',
		1: 'bongo1.wav',
	},
	MEOW: {
		0: 'meow0.wav',
	},
	CYMBAL: {
		1: 'cymbal1.wav',
	},
	HIGHHAT: {
		// https://freewavesamples.com/closed-hi-hat-1
		1: 'highhat1.wav',
	}
};

let samples = {};
let midiPlayer;
let midiPlaying = false;
let channelPaws = {};
let channelInstruments = {};

// General MIDI Drum note mapping for channel 10
// https://soundprogramming.net/file-formats/general-midi-drum-note-numbers/
const drumNoteMap = {
	// Hi-hats
	42: 'HIGHHAT', 44: 'HIGHHAT', 46: 'HIGHHAT',
	// Cymbals
	49: 'CYMBAL', 51: 'CYMBAL', 52: 'CYMBAL',
	53: 'CYMBAL', 55: 'CYMBAL', 57: 'CYMBAL', 59: 'CYMBAL',
	// Bongos, Toms, Congas
	60: 'BONGO', 61: 'BONGO', 62: 'BONGO', 63: 'BONGO', 64: 'BONGO', 65: 'BONGO',
	41: 'BONGO', 43: 'BONGO', 45: 'BONGO', 47: 'BONGO', 48: 'BONGO', 50: 'BONGO',
};

const mario = 'data:audio/midi;base64,TVRoZAAAAAYAAQAMAHhNVHJrAAAAGQD/WAQEAhgIAP9ZAgAAAP9RAwYagAD/LwBNVHJrAAAHNQD/IQEAAP8DBExlYWQAwEoAkFZkAGJkKGIAAFYAFFZkAGJkKGIAAFYAFFZkAGJkKGIAAFYAFEpkAFZkKFYAAEoAFFZkAGJkKGIAAFYAFFZkAGJkKGIAAFYAFFZkAGJkKGIAAFYAFEpkAFZkKFYAAEoAFFdkAGNkgXBjAABXAABiZC1iAIEHVmQtVgAPX2QtXwAPX2QtXwAPX2QtXwAPVmQtVgAPX2QtXwAPX2QtXwAPX2QtXwAPVmQtVgAPX2QtXwAPX2QtXwAPX2QtXwAPX2QeXwAAYGQeYAAAX2R4XwAAXWQtXQAQVmQtVgAPXWQtXQAPXWQtXQAPXWQtXQAPVmQtVgAPXWQtXQAPXWQtXQAPXWQtXQAPVmQtVgAPXWQtXQAPXWQtXQAPXWQtXQAPXWQeXQAAX2QeXwAAXWR3W2QBXQAsWwAPVmQtVgAPX2QtXwAPX2QtXwAPX2QtXwAPVmQtVgAPX2QtXwAPX2QtXwAPX2QtXwAPVmQtVgAPX2QtXwAPX2QtXwAPX2QtXwAPXWQeXQAAX2QeXwAAYGR4YAAAZGR4ZAAAYmQtYgAPYmQtYgAPYmQtYgAPVmQtVgAPYGQtYAAPYGQtYAAPYGQtYAAPWmQtWgAPW2SBcFsAeFNkWlMAAFFkHlEAAFNkgXBTAABWZIFwVgAAVGSBcFQAAFhkgXBYAABaZHhaAABbZHhbAABdZHhdAABgZHhgAABfZIFwXwB4U2RaUwAAUWQeUQAAU2SBcFMAAFZkgXBWAABUZIFwVAAAWGSBcFgAAFpkeFoAAFlkPFkAAFpkPFoAAGBkgTRgAABaZDxaAABbZIFwWwCBNFdkPFcAAFFkAFhkD1EAAFNkD1MAAFRkD1QAAFgAAFZkD1YAAFhkD1pkD1oAAFtkD1sAAFgAAF1kD10AAF9kAFhkD18AAGBkD2AAAGJkD2IAAFgAAGRQD1pkLWQAD1oAAFtkeFsAAGBkeGAAgyRXZDxXAABYZABRZA9RAABTZA9TAABUZA9UAABYAABWZA9WAABYZA9aZA9aAABbZA9bAABYAABdZA9dAABfZABYZA9fAABgZA9gAABiZA9iAABYAABkUA9aZC1kAA9aAABbZHhbAABgZHhgAIMkV2Q8VwAAUWQAWGQPUQAAU2QPUwAAVGQPVAAAWAAAVmQPVgAAWGQPWmQPWgAAW2QPWwAAWAAAXWQPXQAAX2QAWGQPXwAAYGQPYAAAYmQPYgAAWAAAZFAPWmQtZAAPWgAAW2R4WwAAYGR4YACFUEpkHkoAHlFkHlEAHlZkHlYAHl1kHl0AHmJkHmIAgwZWZC1WAA9fZC1fAA9fZC1fAA9fZC1fAA9WZC1WAA9fZC1fAA9fZC1fAA9fZC1fAA9WZC1WAA9fZC1fAA9fZC1fAA9fZC1fAA9fZB5fAABgZB5gAABfZHhfAABdZC1dABBWZC1WAA9dZC1dAA9dZC1dAA9dZC1dAA9WZC1WAA9dZC1dAA9dZC1dAA9dZC1dAA9WZC1WAA9dZC1dAA9dZC1dAA9dZC1dAA9dZB5dAABfZB5fAABdZHdbZAFdACxbAA9WZC1WAA9fZC1fAA9fZC1fAA9fZC1fAA9WZC1WAA9fZC1fAA9fZC1fAA9fZC1fAA9WZC1WAA9fZC1fAA9fZC1fAA9fZC1fAA9dZB5dAABfZB5fAABgZHhgAABkZHhkAABiZC1iAA9iZC1iAA9iZC1iAA9WZC1WAA9gZC1gAA9gZC1gAA9gZC1gAA9aZC1aAA9bZIFwWwB4U2RaUwAAUWQeUQAAU2SBcFMAAFZkgXBWAABUZIFwVAAAWGSBcFgAAFpkeFoAAFtkeFsAAF1keF0AAGBkeGAAAF9kgXBfAHhTZFpTAABRZB5RAABTZIFwUwAAVmSBcFYAAFRkgXBUAABYZIFwWAAAWmR4WgAAWWQ8WQAAWmQ8WgAAYGSBNGAAAFpkPFoAAFtkgXBbAIE0V2Q8VwAAUWQAWGQPUQAAU2QPUwAAVGQPVAAAWAAAVmQPVgAAWGQPWmQPWgAAW2QPWwAAWAAAXWQPXQAAX2QAWGQPXwAAYGQPYAAAYmQPYgAAWAAAZFAPWmQtZAAPWgAAW2R4WwAAYGR4YACDJFdkPFcAAFhkAFFkD1EAAFNkD1MAAFRkD1QAAFgAAFZkD1YAAFhkD1pkD1oAAFtkD1sAAFgAAF1kD10AAF9kAFhkD18AAGBkD2AAAGJkD2IAAFgAAGRQD1pkLWQAD1oAAFtkeFsAAGBkeGAAgyRXZDxXAABRZABYZA9RAABTZA9TAABUZA9UAABYAABWZA9WAABYZA9aZA9aAABbZA9bAABYAABdZA9dAABfZABYZA9fAABgZA9gAABiZA9iAABYAABkUA9aZC1kAA9aAABbZHhbAABgZHhgAIVQSmQeSgAeUWQeUQAeVmQeVgAeXWQeXQAeYmQeYgCDBlZkLVYAAP8vAE1UcmsAAAAxAP8hAQAA/wMFSW50cm8AwSWBNJEyZC0yAIFDMmQtMgCCOzlkLTkADzJkLTIAAP8vAE1UcmsAABJNAP8hAQAA/wMLQmFja3VwL0Jhc3MAwlGDYJI/ZAA5ZABFZIFwRQAAOQAAPwAANmQAPmQAQmQtQgAAPgAANgCBQytkLSsADztkAENkLUMAADsADztkAENkLUMAADsASytkLSsAD0NkADtkLTsAAEMADztkAENkLUMAADsASytkLSsAD0NkADtkLTsAAEMADztkAENkLUMAADsASyZkLSYADzlkAEJkLUIAADkADzlkAEJkLUIAADkASyZkLSYADzlkAEJkLUIAADkADzlkAEJkLUIAADkASyZkLSYADzlkAEJkLUIAADkADzlkAEJkLUIAADkASyZkLSYADzlkAEJkLUIAADkADzlkAEJkLUIAADkASytkLSsAD0NkADtkLTsAAEMAD0NkADtkLTsAAEMAS09QACtkLSsAD0NkADtkLTsAAEMADztkAENkLUMAADsAS08AAE1QAC9kLS8AD0FkAEdkLUcAAEEAD0FkAEdkLUcAAEEAS00AAExQADBkLTAAD0BkAEhkLUgAAEAAD0BkAEhkLUgAAEAAS0wAADFkAEtQLTEADz9kAElkLUkAAD8ADz9kAElkLUkAAD8AS0sAADJkAEpQLTIAD0JkAEVkLUUAAEIAD0JkAEVkLUUAAEIAS0oAACpkAEhQLSoADz5kAEJkLUIAAD4ADz5kAEJkLUIAAD4AS0gAAC9kADdkAEdQLTcAAC8ASytkAC9kLS8AACsAS0cAAC9kADdkLTcAAC8AS0pkWkoAAEhkHkgAADdkACtkAEdkPDcAADtkPDsAAEcAAD5kAEpkPD4AADtkPDsAAEoAACsAADdkAC9kAE9kPDcAADtkPDsAAD5kPD4AAE8AAE5kADtkPDsAAE4AAC8AADxkADBkAEtkPDwAAEBkPEAAAEsAAENkAExkPEMAAEBkPEAAAEwAADAAADFkAD1kAFFkPD0AAEBkPEAAAENkPEMAAFEAAE9kAEBkPEAAAE8AADEAAD5kADJkPD4AAEJkPEIAAEVkPEUAAEJkPEIAADIAAD5kAC1kPD4AAEJkPEIAAEVkPEUAAEJkPEIAAC0AADdkAC9kPDcAADtkPDsAAD5kPD4AADtkPDsAAC8AADdkACtkPDcAADtkPDsAAEpkAD5kPD4AADtkHkoAAEhkHkgAADsAACsAADdkACtkAEdkPDcAADtkPDsAAEcAAD5kAEpkPD4AADtkPDsAAEoAACsAADdkAC9kAE9kPDcAADtkPDsAAD5kPD4AAE8AAE5kADtkPDsAAE4AAC8AADxkADBkAEtkPDwAAEBkPEAAAEsAAENkAExkPEMAAEBkPEAAAEwAADAAADFkAD1kAFFkPD0AAEBkPEAAAENkPEMAAFEAAEBkAE9kPE8AAEAAADEAAD5kADJkPD4AAEJkPEIAAEVkPEUAAEJkPEIAADIAADlkACpkPDkAAD5kPD4AAEJkPEIAAD5kPD4AACoAADtkACtkPDsAAD5kPD4AADlkPDkAAD5kPD4AACsAADdkPDcAgTQrZAAwZIEWMAAAKwAeK2QAMGQ8MAAAKwAAK2QAMGR4MAAAKwB4K2QAL2QAQ2QAR2QoRwAAQwAARWQASGQoSAAARQAAQ2QAR2QoRwAAQwAAQmQARWQoRQAAQgAAQ2QAR2QoRwAAQwAAQmQARWQoRQAAKwAALwAAQgAAK2QAPmQAQ2R4QwAAPgAAPmQAO2Q8OwAAPgA8KwAAK2QAMGSBFjAAACsAHitkADBkPDAAACsAACtkADBkeDAAACsAeCtkAC9kAENkAEdkKEcAAEMAAEVkAEhkKEgAAEUAAENkAEdkKEcAAEMAAEJkAEVkKEUAAEIAAENkAEdkKEcAAEMAAEJkAEVkKEUAACsAAC8AAEIAACtkAD5kAENkeEMAAD4AAD5kADtkPDsAAD4APCsAACtkADBkgRYwAAArAB4rZAAwZDwwAAArAAArZAAwZHgwAAArAHhKZAA2ZAA5ZAAyZC0yAABKAAA2AAA5AA9JZC1JAA9KZC1KAA9FZC1FAA8tZAA2ZAAyZABFZC1FAAAtAAA2AAAyAA89ZC09AA8+ZC0+AA85ZABFZC1FAAA5AA8/ZAAtZAAzZACyB0gB4gBCAQBDAQBEAbIHSQDiAEUBAEcBAEgCsgdKAOIASQGyB0sA4gBEAbIHTADiAD8BAD0BsgdNAOIAOgKyB04B4gA7AQA9AbIHTwDiAD4BAD8BsgdQAOIAQQEAQwGyB1EA4gBEAQBFArIHUgDiAEYCsgdTAOIARAEAPwEAOwGyB1QC4gA/AbIHVQDiAEIBAEQBAEYBsgdWAeIASAOyB1cA4gBFAQBCAQA/AbIHWADiAD0BADoDsgdZAOIAOwEAPgEAQwEARQEARwGyB1oA4gBIAwBFAbIHWwDiAEMBAD8BADsBsgdcAOIAOQOyB10B4gA/AbIHXwDiAEIBAEUCsgdgAOIARgOyB2EB4gBDAQA+AQA6ArIHYgHiADsBsgdjAOIAPAEAPQGyB2QA4gBAAQBCAbIHZQDiAEQBAEUBAEYCsgdmAuIAQgGyB2cA4gBAAQA7AQA6ArIHaALiADsBAD0BsgdpAOIAQAEAQgEARQEARgEARwEASAKyB2oBB2sB4gBHAQBDAQA+AQA5ArIHbADiADoBADsBAD0BAEABsgdtAOIAQgEARQEARgEARwEASQGyB24D4gBIAbIHcADiAEMBAEIBsgdxAOIAPgEAOwGyB3ICB3MB4gA8AQBAAbIHdADiAEIBAEUBsgd1AOIARwEASAKyB3YBB3cB4gBJAbIHeAIHeQDiAEcBAEQBAD8Bsgd6AOIAOwEAOgGyB3sCB3wBB30A4gA7AQA8AQA9AQA/AQBBAQBDAQBFAQBHBQA/AQA9AQA7AQA6BAA8AQA+AQBCAQBDAQBGAQBIAwBHAQBBAQA+AQA9AQA7AQA6AwA7AQA/AQBBAQBEAQBGAQBIBABGAQBDAQBCAQA+AQA8AQA6AgA5AwA6AQA7AQA9AQBAAQBBAQBEAQBGAQBHAQBJAgBKAgBHAQBFAQBCAQA+AQA9AQA6AQA5BgBAAQBDAQBFAQBHAwBIAQBJAgBIAQBEAQBCAQBBAZIzAAAtAAA/AAA+ZAAyZAA2ZADiAEA8kjYAADIAAD4AgyQ2ZAA5ZAA+ZIE0PgAAOQAANgA8K2QtKwAPO2QAQ2QtQwAAOwAPO2QAQ2QtQwAAOwBLK2QtKwAPQ2QAO2QtOwAAQwAPO2QAQ2QtQwAAOwBLK2QtKwAPQ2QAO2QtOwAAQwAPO2QAQ2QtQwAAOwBLJmQtJgAPOWQAQmQtQgAAOQAPOWQAQmQtQgAAOQBLJmQtJgAPOWQAQmQtQgAAOQAPOWQAQmQtQgAAOQBLJmQtJgAPOWQAQmQtQgAAOQAPOWQAQmQtQgAAOQBLJmQtJgAPOWQAQmQtQgAAOQAPOWQAQmQtQgAAOQBLK2QtKwAPQ2QAO2QtOwAAQwAPQ2QAO2QtOwAAQwBLT1AAK2QtKwAPQ2QAO2QtOwAAQwAPO2QAQ2QtQwAAOwBLTwAATVAAL2QtLwAPQWQAR2QtRwAAQQAPQWQAR2QtRwAAQQBLTQAATFAAMGQtMAAPQGQASGQtSAAAQAAPQGQASGQtSAAAQABLTAAAMWQAS1AtMQAPP2QASWQtSQAAPwAPP2QASWQtSQAAPwBLSwAAMmQASlAtMgAPQmQARWQtRQAAQgAPQmQARWQtRQAAQgBLSgAAKmQASFAtKgAPPmQAQmQtQgAAPgAPPmQAQmQtQgAAPgBLSAAAL2QAN2QAR1AtNwAALwBLK2QAL2QtLwAAKwBLRwAAL2QAN2QtNwAALwBLSmRaSgAASGQeSAAAN2QAK2QAR2Q8NwAAO2Q8OwAARwAAPmQASmQ8PgAAO2Q8OwAASgAAKwAAN2QAL2QAT2Q8NwAAO2Q8OwAAPmQ8PgAATwAATmQAO2Q8OwAATgAALwAAPGQAMGQAS2Q8PAAAQGQ8QAAASwAAQ2QATGQ8QwAAQGQ8QAAATAAAMAAAMWQAPWQAUWQ8PQAAQGQ8QAAAQ2Q8QwAAUQAAT2QAQGQ8QAAATwAAMQAAPmQAMmQ8PgAAQmQ8QgAARWQ8RQAAQmQ8QgAAMgAAPmQALWQ8PgAAQmQ8QgAARWQ8RQAAQmQ8QgAALQAAN2QAL2Q8NwAAO2Q8OwAAPmQ8PgAAO2Q8OwAALwAAN2QAK2Q8NwAAO2Q8OwAASmQAPmQ8PgAAO2QeSgAASGQeSAAAOwAAKwAAN2QAK2QAR2Q8NwAAO2Q8OwAARwAAPmQASmQ8PgAAO2Q8OwAASgAAKwAAN2QAL2QAT2Q8NwAAO2Q8OwAAPmQ8PgAATwAATmQAO2Q8OwAATgAALwAAPGQAMGQAS2Q8PAAAQGQ8QAAASwAAQ2QATGQ8QwAAQGQ8QAAATAAAMAAAMWQAPWQAUWQ8PQAAQGQ8QAAAQ2Q8QwAAUQAAQGQAT2Q8TwAAQAAAMQAAPmQAMmQ8PgAAQmQ8QgAARWQ8RQAAQmQ8QgAAMgAAOWQAKmQ8OQAAPmQ8PgAAQmQ8QgAAPmQ8PgAAKgAAO2QAK2Q8OwAAPmQ8PgAAOWQ8OQAAPmQ8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';

$(document).ready(function() {
	// Initialize Tone.js
	for (instrument in SampleMapping) {
		let onload = ((instrument) => console.log(instrument + ' samples loaded'))(instrument);

		// Melodic instruments
		if ([ 'KEYBOARD', 'MARIMBA' ].includes(instrument)) {
			samples[instrument] = new Tone.Sampler(SampleMapping[instrument], {
				release: 1,
				baseUrl: './samples/',
				onload: onload,
			}).toMaster();
		}
		// Percussive / samples
		else {
			// Make a proxy object that behaves like Tone.Sampler
			samples[instrument] = {};
			for (sampleNumber in SampleMapping[instrument]) {
				samples[instrument][sampleNumber] = new Tone.Player('./samples/' + SampleMapping[instrument][sampleNumber], {
					onload: onload,
				}).toMaster();
			}

			const keyMapping = {
				'BONGO': 0,
				'CYMBAL': 1,
				'HIGHHAT': 1,
			};
			samples[instrument].triggerAttack = ((instrumentSample) => (key) => {
				if (!(key in instrumentSample)) {
					key = keyMapping[instrument];
				}
				instrumentSample[key].start();
			})(samples[instrument]);
			samples[instrument].triggerRelease = ((instrumentSample) => (key) => {
				// instrument[key].stop();
			})(samples[instrument]);
		}
	}

	// Initialize WebMidi
	// https://github.com/tambien/Piano/blob/master/Demo.js
	WebMidi.enable((err) => {
		if (err) {
			console.error('WebMidi could not be enabled', err);
		} else {
			console.log('WebMidi enabled');
		}

		if (WebMidi.inputs) {
			WebMidi.inputs.forEach((input) => $.bindMidiInput(input));
		}

		// Listen for new devices
		WebMidi.addListener('connected', (device) => {
			if (device.input) {
				$.bindMidiInput(device.input);
			}
		});
	});

	let lastPaw = 0;
	let lastTick = 0;
	midiPlayer = new MidiPlayer.Player((event) => {
		const channel = event.track;

		// Handle Program Change events
		if (event.name == 'Program Change') {
			const program = event.value + 1; // MIDI programs are 0-127, GM is 1-128
			let instrument = 'KEYBOARD';

			// General MIDI instrument list
			// https://soundprogramming.net/file-formats/general-midi-instrument-list/
			// Percussive (excluding 113, tinkle bell)
			if (program >= 114 && program <= 119) {
				console.log(`BONGO ${program}`)
				instrument = 'BONGO';
			}
			// Chromatic Percussion (9-16)
			else if (program >= 9 && program <= 16) {
				instrument = 'MARIMBA';
			}

			channelInstruments[channel] = instrument;
			$.updateMidiChannelInstrument(channel, instrument);
			return;
		}

		else if (event.name == 'Note on' && event.velocity > 0) {
			let instrument = channelInstruments[channel];
			
			// Channel 10 is General MIDI drums
			if (channel === 10) {
				const noteNum = event.noteNumber;
				instrument = drumNoteMap[noteNum] || 'BONGO';
			}
			
			instrument = instrument || 'KEYBOARD';

			samples[instrument].triggerRelease(event.noteName);
			samples[instrument].triggerAttack(event.noteName);

			// Main cat - swap paws only on separate ticks
			// (this avoids paws not swapping if an even number of instruments/tracks play on the same tick)
			if (lastTick != event.tick) {
				let paw = +!lastPaw;
				lastPaw = paw;
				if (paw) {
					$.paw('l', true);
					$.paw('r', false);
				} else {
					$.paw('l', false);
					$.paw('r', true);
				}
			}
			lastTick = event.tick;

			// Mini cats (1 cat per channel), swap paws on a per-channel basis
			if (!channelPaws[channel]) {
				$.addMidiChannel(channel, instrument);
				channelPaws[channel] = 0;
			}
			
			// Update mini cat instrument if on channel 10 (drums change per note)
			if (channel === 10) {
				$.updateMidiChannelInstrument(channel, instrument);
			}
			
			channelPaws[channel] = +!channelPaws[channel];
			$.miniPaw(channel, channelPaws[channel] ? 'l' : 'r', true);
			$.miniPaw(channel, channelPaws[channel] ? 'r' : 'l', false);
		}
	});

	$.wait(() => {
		console.log('BONGO CAT TIME');
		$.loadMidi(mario);
		$.playMidi();
	}, 1000);
});

$.loadMidi = function(midiData) {
	$.stopMidi();
	if (typeof midiData === 'string') {
		midiPlayer.loadDataUri(midiData);
	} else if (midiData instanceof ArrayBuffer){
		midiPlayer.loadArrayBuffer(midiData);
	}
};

$.playMidi = function(midiDataUri) {
	midiPlayer.play();
	midiPlaying = true;
	$('#midi-channels').empty();
	channelPaws = {};
};

$.stopMidi = function() {
	midiPlayer.stop();
	midiPlaying = false;
	$('#midi-channels').empty();
	channelPaws = {};
	channelInstruments = {};
};

$.toggleMidi = function() {
	if (midiPlaying) {
		$.stopMidi();
	} else {
		$.playMidi();
	}
};

$.loadMidiFile = function(file) {
	console.log('Loading midi file...', file);
	const reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onload = function(e) {
		const midiData = e.target.result;
		$.loadMidi(midiData);
		$.playMidi();
	};
};

$.paw = function(dir, down) {
	$('#' + dir + 'paw').css('background-image', 'url("./' + dir + (down ? 2 : 1) + '.png"');
};

$.miniPaw = function(channel, dir, down) {
	$('#ch' + channel + '-' + dir + 'paw').css('background-image', 'url("./' + dir + (down ? 2 : 1) + '.png")');
};

$.addMidiChannel = function(channel, instrument) {
	if ($('#mini-cat-' + channel).length) return;

	instrument = instrument.toLowerCase();
	const cat = $('<div class="mini-cat" id="mini-cat-' + channel + '">' +
		'<div class="mini-label">Ch ' + channel + '</div>' +
		'<div class="mini-instrument mini-' + instrument + '"></div>' +
		'<div class="mini-lpaw" id="ch' + channel + '-lpaw"></div>' +
		'<div class="mini-rpaw" id="ch' + channel + '-rpaw"></div>' +
		'<div class="mini-mouth" id="ch' + channel + '-mouth"></div>' +
		'</div>');
	$('#midi-channels').append(cat);
};

$.updateMidiChannelInstrument = function(channel, instrument) {
	instrument = instrument.toLowerCase();
	if (instrument === 'highhat') {
		instrument = 'cymbal';
	}
	$('#mini-cat-' + channel + ' .mini-instrument').attr('class', 'mini-instrument mini-' + instrument);
};

Array.prototype.remove = function(el) {
	return this.splice(this.indexOf(el), 1);
};
$.wait = function(callback, ms) {
	return window.setTimeout(callback, ms);
};
$.play = function(instrument, key, state) {
	let instrumentName = Object.keys(InstrumentEnum).find(k => InstrumentEnum[k] === instrument);
	// let commonKey = KeyEnum[key];
	let commonKey = key;
	let paw = (instrument == InstrumentEnum.BONGO ? key : key <= 5 && key != 0 ? 0 : 1);
	let id = (instrument == InstrumentEnum.MEOW ? '#mouth' : '#' + (paw == 0 ? 'l' : 'r') + 'paw');
	if (state == true) {
		if (jQuery.inArray(commonKey, pressed) !== -1) {
			return;
		} else {
			pressed.push(commonKey);
		}
		if (instrument != InstrumentEnum.MEOW) {
			$('.instrument').each(function(index) {
				if ($(this).attr('id') === instrumentName.toLowerCase()) {
					$(this).css('visibility', 'visible');
				} else {
					$(this).css('visibility', 'hidden');
				}
			});
		}
		console.log(instrumentName);
		samples[instrumentName].triggerAttack(commonKey);
		// $.sound(instrumentName + key);
	} else {
		samples[instrumentName].triggerRelease(commonKey);
		pressed.remove(commonKey);
	}
	if (instrument == InstrumentEnum.MEOW) {
		$('#mouth').css('background-image', 'url("./m' + (state === true ? '2' : '1') + '.png")');
	} else {
		$(id).css('background-image', 'url("./' + (paw == 0 ? 'l' : 'r') + (state === true ? '2' : '1') + '.png")');
	}
};

$(document).bind('contextmenu', function(e) {
	e.preventDefault();
});
$(document).ready(function() {
	function isTouch() {
		const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
		let mq = function(query) {
			return window.matchMedia(query).matches;
		};
		if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
			return true;
		}
		let query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
		return mq(query);
	}
	if (isTouch()) {
		$.tap = function(e, keyboardEquivalent) {
			e.preventDefault();
			let instrument = InstrumentPerKeyEnum[keyboardEquivalent.toUpperCase()];
			let key = KeyEnum[keyboardEquivalent.toUpperCase()];
			if (instrument != undefined && key != undefined) {
				$.play(instrument, key, true);
				$.wait(function() {
					$.play(instrument, key, false);
				}, (instrument == InstrumentEnum.MEOW ? 250 : 80));
			}
		};
		$('#bongo-left').css('visibility', 'visible').on('touchstart', function(e) {
			$.tap(e, 'A');
		});
		$('#bongo-right').css('visibility', 'visible').on('touchstart', function(e) {
			$.tap(e, 'D');
		});
		$('#cymbal-left').css('visibility', 'visible').on('touchstart', function(e) {
			$.tap(e, 'C');
		});
		$('#piano-keys').css('visibility', 'visible');
		$('#key1').on('touchstart', function(e) {
			$.tap(e, '1');
		});
		$('#key2').on('touchstart', function(e) {
			$.tap(e, '2');
		});
		$('#key3').on('touchstart', function(e) {
			$.tap(e, '3');
		});
		$('#key4').on('touchstart', function(e) {
			$.tap(e, '4');
		});
		$('#key5').on('touchstart', function(e) {
			$.tap(e, '5');
		});
		$('#key6').on('touchstart', function(e) {
			$.tap(e, '6');
		});
		$('#key7').on('touchstart', function(e) {
			$.tap(e, '7');
		});
		$('#key8').on('touchstart', function(e) {
			$.tap(e, '8');
		});
		$('#key9').on('touchstart', function(e) {
			$.tap(e, '9');
		});
		$('#key0').on('touchstart', function(e) {
			$.tap(e, '0');
		});
		$('#marimba-keys').css('visibility', 'visible');
		$('#keyQ').on('touchstart', function(e) {
			$.tap(e, 'Q');
		});
		$('#keyW').on('touchstart', function(e) {
			$.tap(e, 'W');
		});
		$('#keyE').on('touchstart', function(e) {
			$.tap(e, 'E');
		});
		$('#keyR').on('touchstart', function(e) {
			$.tap(e, 'R');
		});
		$('#keyT').on('touchstart', function(e) {
			$.tap(e, 'T');
		});
		$('#keyY').on('touchstart', function(e) {
			$.tap(e, 'Y');
		});
		$('#keyU').on('touchstart', function(e) {
			$.tap(e, 'U');
		});
		$('#keyI').on('touchstart', function(e) {
			$.tap(e, 'I');
		});
		$('#keyO').on('touchstart', function(e) {
			$.tap(e, 'O');
		});
		$('#keyP').on('touchstart', function(e) {
			$.tap(e, 'P');
		});
		$('#meow').css('visibility', 'visible').on('touchstart', function(e) {
			$.tap(e, ' ');
		});

		$('#play-midi').css('visibility', 'visible').on('touchstart', function(e) {
			$.toggleMidi();
		});
	}
});
$(document).on('mousedown mouseup', function(e) {
	let keyboardEquivalent = ClickKeyEquivalentEnum[e.which];
	if (keyboardEquivalent != undefined) {
		let instrument = InstrumentPerKeyEnum[keyboardEquivalent.toUpperCase()];
		let key = KeyEnum[keyboardEquivalent.toUpperCase()];
		if (instrument != undefined && key != undefined) {
			$.play(instrument, key, e.type === 'mousedown');
		}
	}
});
$(document).on('keydown keyup', function(e) {
	let instrument = InstrumentPerKeyEnum[e.key.toUpperCase()];
	let key = KeyEnum[e.key.toUpperCase()];
	if (instrument != undefined && key != undefined) {
		$.play(instrument, key, e.type === 'keydown');
	} else if (e.key === 'm' && e.type === 'keydown') {
		$.toggleMidi();
	}
});

// File upload
$('#midi-file-input').on('change', function(e) {
	if (e.target.files.length > 0) {
		$.loadMidiFile(e.target.files[0]);
	}
});

// Drag-and-drop handling
$(document).on('dragover', function(e) {
	e.preventDefault();
	e.stopPropagation();
});

$(document).on('drop', function(e) {
	e.preventDefault();
	e.stopPropagation();
	const files = e.originalEvent.dataTransfer.files;
	if (files.length > 0 && (files[0].name.endsWith('.mid') || files[0].name.endsWith('.midi'))) {
		$.loadMidiFile(files[0]);
	}
});
