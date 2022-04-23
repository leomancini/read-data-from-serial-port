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
    let string = new TextDecoder().decode(params.value);
    let integer = Math.round(parseInt(string));

    if (integer && integer !== null) {
        if (params.type === 'initialize') {
            console.log(`initial value: ${integer}`);

            updateObjects(integer);
            window.value = integer;
        } else {
            if (Math.abs(window.value - integer) >= 3 && Math.abs(window.value - integer) < 20) {
                updateObjects(integer);
                window.value = integer;
            }
        }

    }
}

function updateObjects(integer) {
    if (!isNaN(integer)) {
        let degrees = convertRange(integer, [0, 1024], [0, 360]);
        degrees = Math.round(degrees);

        document.querySelector('#output').innerText = degrees;
        console.log(degrees);

        document.querySelector('#object').style = `transform: translate(-50%, -50%) rotate(${degrees}deg);`
    }
}

function convertRange( value, r1, r2 ) { 
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

document.querySelector('button').addEventListener('click', async () => {
    // Prompt user to select any serial port.
    const port = await navigator.serial.requestPort();
});

async function initialize() {
    if ('serial' in navigator) {
        const ports = await navigator.serial.getPorts();
        const port = ports[0];
        await port.open({ baudRate: 9600 });

        const reader = port.readable.getReader();
        const { value, done } = await reader.read();

        setValue({
            type: 'initialize',
            value
        });

        listenForChanges(reader);
    }
}

initialize();