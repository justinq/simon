#! /bin/bash

set -o errexit # exit on error

usage()
{
    cat << EOF
    usage: $0 options

    Upload the folder using rsync

    OPTIONS:
       -h      Show this message
       -s      Server and folder to upload to
EOF
}

HOST='justinq@justinq.net:public_html/projects/simon'

while getopts “hs:” OPTION
do
    case $OPTION in
        h)
            usage
            exit 1
            ;;
        s)
            HOST=$OPTARG
            ;;
        ?)
            usage
            exit
            ;;
    esac
done
shift $(($OPTIND - 1))

echo "Uploading to host $HOST"
rsync --verbose  --progress --stats --compress --rsh=/usr/bin/ssh \
      --recursive --times --perms --links --delete \
      --exclude "*bak" --exclude "*~" \
      --exclude ".git*" --exclude "*.sh" \
      --exclude "lib/d3/examples" --exclude "lib/d3/lib" \
      --exclude "lib/d3/src" --exclude "lib/d3/test" \
      ./* $HOST

