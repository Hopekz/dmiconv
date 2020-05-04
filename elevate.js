"use strict";
const sudo = require("sudo-prompt");
const exec = Array.from(process.argv);
exec.shift();
exec.shift();
const execStr = exec.join(" ");
sudo.exec(execStr, { name: "Elevation" }, (error, stdout, stderr) => {
    if (error)
        throw error;
    process.stdout.write(stdout);
    process.stderr.write(stderr);
});
//# sourceMappingURL=elevate.js.map