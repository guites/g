# Instalation

## Overview

The app can be booted locally using Docker, which creates a database containing dummy data and runs the backend node.js app.

It also creates a separate container in which you can run the development webpack server using `npm run dev`.

The backend code is fetched via [github](https://github.com/guites/gchan-backend), and in order to fetch new commits, you will have to rebuild the backend service without using the docker cache.

A quick workaround for this is changing the value of the `CACHEBUST` argument in `.devcontainer/backend.Dockerfile`.

For example

        - ARG CACHEBUST=1
        + ARG CACHEBUST=2

will force docker to make a new request to the github server.

After making this change, you can rebuild the containers normally.

**Regarding CORS errors**: always access the frontend via `http://localhost:8080`. Any other URL will result in CORS errors, as the backend container only sets the header for that specific url.

## Using VS Code's devcontainer

If you use vscode, you can easilly set up the project using the Remote - Containers extension.

1. Install the extension via VS Code > extensions or this [link](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Go to View > Command Palette... and select option `>Remote-Containers: Reopen in Container`.
3. Open the terminal and run `npm install` and then `npm run dev`.
4. Access <http://localhost:8080> and verify that the app is running.

The devcontainer will include a few VS Code extensions which you can edit by changing the `extensions` property in `.devcontainer/devcontainer.json`.

## Using Docker

If you are using Docker there are a few extra steps which I've bundled in the `docker-start.sh` script.

Please inspect the script for further information, and run it using

```
./docker-start.sh
```

## Styling (scss)

This project uses sass and compiles it with [gulp](https://gulpjs.com).

You can edit the files in src/assets/sass and generate the css files with `npm run sass`.