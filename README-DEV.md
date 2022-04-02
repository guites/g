# Instalation

The app can be booted locally using Docker, which creates a database containing dummy data and runs the backend node.js app.

It also creates a separate container in which you can run the development webpack server using `npm run dev`.

## Using VS Code's devcontainer

If you use vscode, you can easilly set up the project using the Remote - Containers extension.

1. Install the extension via VS Code > extensions or this [link](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Go to View > Command Palette... and select option `>Remote-Containers: Reopen in Container`.
3. Open the terminal and run `npm run dev`.
4. Access <http://localhost:8080> and verify that the app is running.

The devcontainer will include a few VS Code extensions which you can edit by changing the `extensions` property in `.devcontainer/devcontainer.json`.

## Using Docker

If you are using Docker there are a few extra steps which I've bundled in the `docker-start.sh` script.

Please inspect the script for further information, and run it using

```
./docker-start.sh
```
