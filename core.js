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
	'1': 1,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'0': 0,
	' ': 0,
	'C': 1,
	'Q': 1,
	'W': 2,
	'E': 3,
	'R': 4,
	'T': 5,
	'Y': 6,
	'Z': 6,
	'U': 7,
	'I': 8,
	'O': 9,
	'P': 0,
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
$(document).ready(function() {
	lowLag.init();
	lowLag.load(['bongo0.mp3', 'bongo0.wav'], 'bongo0');
	lowLag.load(['bongo1.mp3', 'bongo1.wav'], 'bongo1');
	lowLag.load(['keyboard1.mp3', 'keyboard1.wav'], 'keyboard1');
	lowLag.load(['keyboard2.mp3', 'keyboard2.wav'], 'keyboard2');
	lowLag.load(['keyboard3.mp3', 'keyboard3.wav'], 'keyboard3');
	lowLag.load(['keyboard4.mp3', 'keyboard4.wav'], 'keyboard4');
	lowLag.load(['keyboard5.mp3', 'keyboard5.wav'], 'keyboard5');
	lowLag.load(['keyboard6.mp3', 'keyboard6.wav'], 'keyboard6');
	lowLag.load(['keyboard7.mp3', 'keyboard7.wav'], 'keyboard7');
	lowLag.load(['keyboard8.mp3', 'keyboard8.wav'], 'keyboard8');
	lowLag.load(['keyboard9.mp3', 'keyboard9.wav'], 'keyboard9');
	lowLag.load(['keyboard0.mp3', 'keyboard0.wav'], 'keyboard0');
	lowLag.load(['meow0.mp3', 'meow0.wav'], 'meow0');
	lowLag.load(['cymbal1.mp3', 'cymbal1.wav'], 'cymbal1');
	lowLag.load(['marimba1.mp3', 'marimba1.wav'], 'marimba1');
	lowLag.load(['marimba2.mp3', 'marimba2.wav'], 'marimba2');
	lowLag.load(['marimba3.mp3', 'marimba3.wav'], 'marimba3');
	lowLag.load(['marimba4.mp3', 'marimba4.wav'], 'marimba4');
	lowLag.load(['marimba5.mp3', 'marimba5.wav'], 'marimba5');
	lowLag.load(['marimba6.mp3', 'marimba6.wav'], 'marimba6');
	lowLag.load(['marimba7.mp3', 'marimba7.wav'], 'marimba7');
	lowLag.load(['marimba8.mp3', 'marimba8.wav'], 'marimba8');
	lowLag.load(['marimba9.mp3', 'marimba9.wav'], 'marimba9');
	lowLag.load(['marimba0.mp3', 'marimba0.wav'], 'marimba0');
});

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
		// this.emit('keyDown', event.note.number, event.velocity);
	});
	inputDevice.addListener('noteoff', 'all', (event) => {
		console.log('noteoff');
		// this.emit('keyUp', event.note.number, event.velocity);
		// keyboard, 0, true
	});

	inputDevice.addListener('controlchange', 'all', (event) => {
		if (event.controller.name === 'holdpedal') {
			// this.emit(event.value ? 'pedalDown' : 'pedalUp');
		}
	});
};

$(document).ready(function() {
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
$.play = function(instrument, key, state) {
	let instrumentName = Object.keys(InstrumentEnum).find(k => InstrumentEnum[k] === instrument).toLowerCase();
	let commonKey = KeyEnum[key];
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
				if ($(this).attr('id') === instrumentName) {
					$(this).css('visibility', 'visible');
				} else {
					$(this).css('visibility', 'hidden');
				}
			});
		}
		$.sound(instrumentName + key);
	} else {
		pressed.remove(commonKey);
	}
	if (instrument == InstrumentEnum.MEOW) {
		$('#mouth').css('background-image', 'url("./m' + (state === true ? '2' : '1') + '.png")');
	} else {
		$(id).css('background-image', 'url("./' + (paw == 0 ? 'l' : 'r') + (state === true ? '2' : '1') + '.png")');
	}
};
$.sound = function(filename) {
	lowLag.play(filename);
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
