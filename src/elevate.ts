const sudo = require("sudo-prompt");

const exec = Array.from(process.argv);
exec.shift();
exec.shift();
const execStr = exec.join(" ");
sudo.exec(execStr, {name: "Elevation"}, (error: Error, stdout: string, stderr: string) => {
    if(error) throw error;
    process.stdout.write(stdout);
    process.stderr.write(stderr);
});
