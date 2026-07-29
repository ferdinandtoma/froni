# Froni foundation questionnaire

Private local questionnaire for Ferdinand Toma. This application is separate
from `site\` and must never be deployed with froni.co.

## Run

```powershell
node C:\froni\brand-questionnaire\server.mjs
```

Open `http://localhost:4950`.

For phone access on the same trusted Wi-Fi:

```powershell
node C:\froni\brand-questionnaire\server.mjs --lan
```

Open the private `Phone:` address printed by the server. The access key protects
answers and attachments from other devices that do not have the complete link.
The phone still saves everything to this computer.

Answers save continuously to:

```text
C:\froni\brand-questionnaire\answers\answers.json
```

Attachments save under `answers\attachments\`. The application does not make
network requests and does not send any data outside the computer.

The download control creates one portable JSON backup containing the answers and
the attachment files. Importing that backup restores both. The complete
`answers\` directory is ignored by Git.
