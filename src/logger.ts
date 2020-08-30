const enabled = 'ENV_DEBUG' in process.env;

const log = (str: string): void => console.log(`[LOG]`, str);

export default log;
