const filename = __filename.slice(__dirname.length + 1, -3);
const { createLogger, format, transports, addColors } = require("winston");
const { combine, timestamp, printf, colorize } = format;
const appName = require("./config").appName;

// Define custom log levels and colors
const customLogLevels = {
    levels: {
        error: 0, // Crital error messages about application or transactions
        warn: 1, // Warning messages about application or transactions
        info: 2, // Any information about application or transactions
        verbose: 3, // Non-critical warnings or information
        debug: 4, // Additonal Information for debugging for developers
        silly: 5 // Extensive Information for debugging for developers
    },
    colors: {
        error: 'bold white redBG',
        warn: 'bold black yellowBG',
        info: 'bold white',
        verbose: 'white',
        debug: 'bold yellow',
        silly: 'magenta'
    }
}
addColors(customLogLevels.colors);

// List of different transport list such as
// console = logs in the console
// file = logs in the given file name
const tranportsList = {
    console: new transports.Console({ level: 'silly' })
    // file: new transports.File({ filename: 'full_logs.log', level: 'silly' }),
};

// Define custom logging message format
const logFormat = printf((info) => {
    return `${appName} ${info.timestamp} [${info.level}]: ${info.message}`;
});

// Create a logger instance
const log = createLogger({
    levels: customLogLevels.levels,
    level: 'silly',
    format: combine(
        timestamp({ format: 'DD-MMM-YYYY HH:mm:ss.SSS' }),
        colorize(),
        logFormat),
    transports: [
        tranportsList.console
    ],
});

module.exports = { log, tranportsList };