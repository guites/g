#!/bin/bash
# this script will change all references to the prod URLs with the equivalent, docker generated development URLs or vice-versa
environment=$1
[ -z $environment ] && echo "You must define environment in the first argument!" && exit 1
if [[ $environment != 'dev' && $environment != 'prod' ]]; then
    echo "Available environments are \"prod\" and \"dev\" !" && exit 1
fi

# replaces ocurrences of $1 by $2 in src/ directory
# $1 is current url,
# $2 is the new url
swap_urls() {
    while read -r line; do
        sed -i.bu "s{$1{$2{g" $line;
        [ -a $line.bu ] && rm $line.bu
    done < <(grep -rl "$1" src/);
}

if [ $environment == 'dev' ]; then
   swap_urls 'https://gchan.guites.dataware.com.br' 'http://localhost:4450'
   swap_urls 'https://gchan.com.br' 'http://localhost:8080'
fi

if [ $environment == 'prod' ]; then
    swap_urls 'http://localhost:4450' 'https://gchan.guites.dataware.com.br'
    swap_urls 'http://localhost:8080' 'https://gchan.com.br'
fi