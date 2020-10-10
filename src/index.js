const cliProgress = require('cli-progress');
const fs = require('fs');
const path = require('path');
const SimpleMailing = require('simple-mailing').default;
const minimist = require('minimist');

function main() {
    const args = minimist(process.argv.slice(2));
    /**
     * -h HELP!!!
     * -m [path to msg.txt]
     * -p // no arg | send mailing no test mode
     * -s [subject]
     * -r [path to receivers.csv]
     */
    if (args.h) {
      console.log(' -h HELP!!!, -m [path to msg.txt], -p // no arg | send mailing no test mode, -s [subject], -r [path to receivers.csv]');
      return;
    }

    const config = readConfig();

    if (!config.smtp || !config.email || !config.password || !config.port || !config.sender || !config.testReceiver) {
        console.error('please provide a valid config');
    }

    if (!args.m) {
      console.error("please provide -m use -h for help");
      return;
    }

    const message = getFileContent(args.m);
    const subject = args.s

    if (!message || !subject) {
      console.error("please provide -s and -m use -h for help");
      return;
    }

    if (args.p) {
      if (!args.r) {
        console.error("please provide -r use -h for help");
        return;
      }

      const receivers = getReceiversFromCSV(args.r);

      if (!receivers) {
        console.error("no receivers found!");
        return;
      }

      mailing(message, subject, receivers, config);
      return;
    }

    testMailing(message, subject, config);
}

function testMailing(message, subject, config) {
    const mailing = new SimpleMailing(config.smtp, config.port, config.email, config.password);

    mailing.sendMail(config.sender, config.email, [config.testReceiver], subject, message, '').then(() => console.log('test mail sent')).catch(e => console.error(e));
}

function mailing(message, subject, receivers, config) {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    const mailing = new SimpleMailing(config.smtp, config.port, config.email, config.password);
    mailing.setEventlistener('update', (d) => {progressBar.update(d)});
    mailing.setEventlistener('finish', () => progressBar.stop());

    progressBar.start(receivers.length);


    mailing.sendMailing(config.sender, config.email, receivers, subject, message, '',[], 5000).then(() => console.log('mailing finished')).catch(e => console.error(e));
}

function readConfig() {
    const configConfigPath = path.join(__dirname, '..', 'config.json');
    const rawdata = fs.readFileSync(configConfigPath);
    return JSON.parse(rawdata);
}

function getFileContent(filePath) {
    const fileContent = fs.readFileSync(filePath, {encoding: 'utf8'});
    return fileContent;
  }
  
function getReceiversFromCSV(filePath) {
    const fileContent = fs.readFileSync(filePath, {encoding: 'utf8'});
    const lines = fileContent.split('\n')
    const l = lines.map((a) => a.replace('\n', "").replace('\r', ""));
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                      
    const emails = l.filter((line) => re.test(line))
    const uniqueEmails = emails.filter((i, p) => emails.indexOf(i) === p);
  
    return uniqueEmails;
}

function writeConfig() {

}

main();
