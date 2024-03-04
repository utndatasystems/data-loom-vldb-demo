const react_config = {
    deploy: false, // For some cross origin stuff
    auto_login: true,
    host: "localhost",
    port: 23001,
    logging: true,
    protocol: "http",
    debug: true, // Some GUI enhancements for dev
};

const configs = {
    react: react_config,
}

console.log("Using config: '" + process.env.REACT_APP_CONFIG + "'");
const config = configs[process.env.REACT_APP_CONFIG];
if (!config) {
    throw new Error("No config configured. REACT_APP_CONFIG needs to be set");
}

export default config;
