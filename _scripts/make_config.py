#!/usr/bin/env python

import subprocess
import json

files = subprocess.run(
    ['find', '.', '-name', '*.js'], capture_output=True).stdout.decode("ascii").split()

with open("install_files_json.txt", "w") as output:
    output.write(json.dumps({
        "welcomeLabel": "cscheid/bitburner-lib: hello",
        "filesToDownload": list(f[2:] for f in files if not f[2:].startswith(".#"))
        }))

