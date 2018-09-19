const InstrumentEnum = {
	BONGO: 0,
	KEYBOARD: 1,
	MEOW: 3,
	CYMBAL: 4,
	MARIMBA: 5,
};
const KeyEnum = {
	'A': 78,
	'D': 80,
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
	' ': 78,
	'C': 78,
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
	BONGO: {
		78: 'bongo0.wav',
		80: 'bongo1.wav',
	},

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

	MEOW: {
		78: 'meow0.wav',
	},
	CYMBAL: {
		78: 'cymbal1.wav',
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
};
let samples = {};
$(document).ready(function() {
	// Initialize Tone.js
	for (instrument in SampleMapping) {
		samples[instrument] = new Tone.Sampler(SampleMapping[instrument], {
			release: 1,
			baseUrl: './samples/',
			onload: () => { console.log(instrument + 'Samples loaded'); }
		}).toMaster();
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
});

Array.prototype.remove = function(el) {
	return this.splice(this.indexOf(el), 1);
};
$.wait = function(callback, ms) {
	return window.setTimeout(callback, ms);
};
let lastPaw = 0;
$.play = function(instrument, key, state) {
	let instrumentName = Object.keys(InstrumentEnum).find(k => InstrumentEnum[k] === instrument);
	// let commonKey = KeyEnum[key];
	let commonKey = key;
	// let paw = (instrument == InstrumentEnum.BONGO ? key : key <= 5 && key != 0 ? 0 : 1);
	let paw = state ? +!lastPaw : lastPaw;
	lastPaw = paw;
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
	}
});
