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
   echo
}

up_container() {
  docker compose -f .devcontainer/docker-compose.yml up
}

down_container() {
  docker compose -f .devcontainer/docker-compose.yml down
}

run_dev_server() {
  docker exec -it -w /workspace gchan-frontend-app-1 bash -c "npm run dev || exit 1"
}

start_dev_server() {
  .devcontainer/post-start.sh dev
  if ! run_dev_server; then
    docker exec -w /workspace gchan-frontend-app-1 npm install
    run_dev_server
  fi
}

# handle script options
while getopts ":uds" option; do
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
