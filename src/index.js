const cliProgress = require('cli-progress');

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

progressBar.start(500);

setTimeout(() => progressBar.update(100), 2000);
setTimeout(() => progressBar.stop(), 4000)
