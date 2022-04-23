async function listenForChanges(reader) {
	while (true) {
		const { value, done } = await reader.read();

		if (done) {
			reader.releaseLock();
			break;
		}

		setValue({
			type: 'update',
			value
		});
	}
}

function setValue(params) {
	let stringDecoded = new TextDecoder().decode(params.value);
    let stringParsed = stringDecoded.split('\r\n')[0];
    let values = stringParsed.split(',');

    values.forEach((rawValue, index) => {
        let value = Math.round(parseInt(rawValue));

        if (value && value !== null) {
            if (params.type === 'initialize') {
                console.log(`initial value: ${value}`);

                updateObjects(index, value);
                window.values[index] = value;
            } else {
                if (Math.abs(window.values[index] - value) >= 5 && Math.abs(window.values[index] - value) < 20) {
                    updateObjects(index, value);
                    window.values[index] = value;
                }
            }
        }
    });
}

function updateObjects(index, value) {
	if (!isNaN(value)) {
		let degrees = convertRange(value, [0, 1024], [0, 360]);
		degrees = Math.round(degrees);

		document.querySelector('#output').innerText = degrees;

        if (index === 0) {
    		document.querySelector('#object0').style = `transform: rotate(${degrees}deg);`
        } else if (index === 1) {
            document.querySelector('#object1').style = `transform: rotate(${degrees}deg);`
        }
	}
}

function convertRange( value, r1, r2 ) { 
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

document.querySelector('button').addEventListener('click', async () => {
	await navigator.serial.requestPort();
    await initialize();
});

async function initialize() {
	if ('serial' in navigator) {
        window.values = [];

		const ports = await navigator.serial.getPorts();

        if (ports) {
            const port = ports[0];
            await port.open({ baudRate: 9600 });

            const reader = port.readable.getReader();
            const { value, done } = await reader.read();

            setValue({
                type: 'initialize',
                value
            });

            listenForChanges(reader);

            document.querySelector('button').style.opacity = 0;
        }
	}
}

initialize();