#!/bin/bash

Help()
{
   # Display Help
   echo "This script will install all docker related dependencies to run the gchan front end project for development."
   echo "Start by running \"./docker-start.sh -u\" to install and start required containers. "
   echo "With the containers started, run \"./docker-start.sh -s\" to start the development server."
   echo
   echo "sintaxe: docker-start.sh [-u|d|s]"
   echo "options:"
   echo "u     Runs docker-compose up on the project services."
   echo "d     Runs docker-compose down on the project services."
   echo "s     Starts the front-end development server."
   echo "b     Builds the app for deployment into the /dist directory."
   echo "c     Watches for changes in scss files (compiles into css)."
   echo
}

up_container() {
  docker compose -f .devcontainer/docker-compose.yml up
}

down_container() {
  docker compose -f .devcontainer/docker-compose.yml down
}

npm_install() {
  docker exec -w /workspace gchan-frontend-app-1 npm install
}

run_dev_server() {
  docker exec -it -w /workspace gchan-frontend-app-1 bash -c "npm run dev || exit 1"
}

run_build() {
  docker exec -w /workspace gchan-frontend-app-1 npm run build
}

build_deployment_files() {
  .devcontainer/post-start.sh prod
  if ! run_build; then
    npm_install
    run_build
  fi
}

start_dev_server() {
  .devcontainer/post-start.sh dev
  if ! run_dev_server; then
    npm_install
    run_dev_server
  fi
}

watch_sass() {
  docker exec -it -w /workspace gchan-frontend-app-1 bash -c "npm run sass || exit 1"
}

# handle script options
while getopts ":udsbc" option; do
   case $option in
      u) # ups the container
        up_container
        exit;;
      d) # remove all docker related data
        down_container
        exit;;
      s) # starts the development server
        start_dev_server
        exit;;
      b) # builds necessary files for deployment
        build_deployment_files
        exit;;
      c) # Watches for changes in scss files (compiles into css)
        watch_sass
        exit;;
      \?) # invalid option
        echo "Invalid option!"
        Help
        exit;;
   esac
done

# shows help when script is called without params
if [ -z $1 ]; then
    Help
    exit
fi
