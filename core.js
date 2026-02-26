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
let selectedMidiFile = null;

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
			console.log(`${event.name} on track ${event.track}: ${program}`, event);

			// General MIDI instrument list
			// https://soundprogramming.net/file-formats/general-midi-instrument-list/

			// Percussive (excluding 113 Tinkle Bell and 115 Steel Drums)
			if ((program == 114) || (program >= 116 && program <= 119)) {
				console.log(`BONGO ${program}`)
				instrument = 'BONGO';
			}
			// Chromatic Percussion (9-16)
			else if (program >= 9 && program <= 16) {
				instrument = 'MARIMBA';
			}


			// Overrides for specific MIDI files
			if (selectedMidiFile === 'bad_apple.mid') {
				if (event.track === 2 && program === 1) {
					instrument = 'BONGO';
				}
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
		else if (event.name !== 'Note on' && event.name !== 'Note off') {
			console.log(`${event.name} on track ${event.track}`, event);
		}
	});

	$.wait(() => {
		console.log('BONGO CAT TIME');
		$.loadMidiFromUrl('./midi/smw_title.mid');
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

$.loadMidiFromUrl = function(url) {
	console.log('Loading midi from url...', url);
	fetch(url)
		.then(res => res.arrayBuffer())
		.then(buffer => {
			$.loadMidi(buffer);
			$.playMidi();
		});
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

$(document).ready(function() {
	// File upload
	$('#midi-file-input').on('change', function(e) {
		if (e.target.files.length > 0) {
			$.loadMidiFile(e.target.files[0]);
		}
	});

	// MIDI file dropdown select
	$('#midi-selector').on('change', function(e) {
		const path = e.target.value;
		if (path) {
			selectedMidiFile = path.split('/').pop();
			$.loadMidiFromUrl(path);
		}
	});
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
