var ostream = document.getElementById("output");

// Variables
var outputvalue = null;
var mode = null;

// Registers
var rpi = null;
var rsi = null;
var rti = null;

// Helper functions
const assertNotNull = (string) => {
    return string != undefined && string != null && string != "";
};

const error = (type, line, message) => {
    ostream.innerHTML += `<err><b>[${type}]</b> <i>(at line ${line})</i>: ${message}</err>\r\n`;
};

const argumentMissing = ((instruction, required, provided) => {
    error(
        "ArgumentMissing",
        lineno,
        `The instruction '${instruction}' expects ${required} argument, found ${provided}`
    );
});

// Execute func
document.getElementById("exec").addEventListener("click", () => {
    // clear output
    outputvalue = null;

    var code = editor.getValue();

    let split = code.split("\n");

    let lineno = 0;
    let execute = true;

    split.forEach((line) => {
        if (!execute) {
            return;
        }

        lineno++;
        let tokens = line.split(" ");

        // return if comment
        if (tokens[0] === "!" || tokens[0].startsWith("!")) return;

        if (tokens[0] === ".mode") {
            if (assertNotNull(tokens[1])) {
                if (tokens[1] === "jsc") {
                    mode = "jsc";
                } else if (tokens[1] === "core") {
                    error(
                        "ModeNotSupported",
                        lineno,
                        `The mode ${tokens[1]} is not supported by this compiler. Use mode JSC instead`
                    );
                    execute = false;
                } else {
                    error(
                        "AsmModeNotFound",
                        lineno,
                        `The mode ${tokens[1]} is undefined`
                    );
                }
            } else {
                error(
                    "ArgumentMissing",
                    lineno,
                    "The macro '.mode' expects 1 argument, found 0"
                );
            }
        }

        if (mode === "jsc") {
            if (tokens[0] === "push") {
                if (assertNotNull(tokens[1])) {
                    if (tokens[2] === "RTI") {
                        rti = tokens[1];
                    } else if (tokens[2] === "RSI") {
                        rsi = tokens[1];
                    } else {
                        error(
                            "BadRegister",
                            lineno,
                            "Specify a register to store a value to"
                        );
                    }
                } else {
                    error(
                        "ArgumentMissing",
                        lineno,
                        "The instruction 'push' expects 3 argument, found 0"
                    );
                }
            }

            if (tokens[0] === "pop") {
                if (assertNotNull(tokens[1])) {
                    switch (tokens[1]) {
                        case "RSI":
                            rsi = "";
                            break;
                        case "RTI":
                            rti = "";
                            break;
                        case "RPI":
                            rpi = "";
                            break;
                        default:
                            error(
                                "BadRegister",
                                lineno,
                                `Register ${tokens[1]} does not exist`
                            );
                            break;
                    }
                } else {
                    error(
                        "ArgumentMissing",
                        lineno,
                        "The instruction 'pop' expects 1 argument, found 0"
                    );
                }
            }
            if (tokens[0] === "addcs")
                if (assertNotNull(rsi) && assertNotNull(rti)) {
                    outputvalue = parseInt(rsi) + parseInt(rti);
                }

            if (tokens[0] === "subcs")
                if (assertNotNull(rsi) && assertNotNull(rti)) {
                    outputvalue = parseInt(rsi) - parseInt(rti);
                }

            if (tokens[0] === "multcsi")
                if (assertNotNull(rsi) && assertNotNull(rti)) {
                    outputvalue = Math.round(parseInt(rsi) * parseInt(rti));
                }

            if (tokens[0] === "divcsi")
                if (assertNotNull(rsi) && assertNotNull(rti)) {
                    outputvalue = Math.round(parseInt(rsi) / parseInt(rti));
                }

            if (tokens[0] === "multcsf")
                if (assertNotNull(rsi) && assertNotNull(rti)) {
                    outputvalue = parseFloat(rsi) * parseFloat(rti);
                }

            if (tokens[0] === "divcsf")
                if (assertNotNull(rsi) && assertNotNull(rti)) {
                    outputvalue = parseFloat(rsi) / parseFloat(rti);
                }

            if (tokens[0] === "inv" || tokens[0] === "invoke")
                if (assertNotNull(tokens[1])) {
                    if (tokens[1] === "0xD1422")
                        if (assertNotNull(outputvalue))
                            ostream.innerHTML += outputvalue + `\r\n`;
                        else
                            ostream.innerHTML += `<err><b>EmptyRegister</b> <i>(at line ${lineno})</i>: Output register is empty (NULL)</err> \r\n`;
                } else {
                    ostream.innerHTML += `<err><b>ArgumentMissing</b> <i>(at line ${lineno})</i>: Instruction 'invoke' takes 1 argument, provided: 0</err> \r\n`;
                }
        } else {
            error("UndefinedMode", lineno, `AsmMode is not specified`);
            execute = false;
        }
    });
});