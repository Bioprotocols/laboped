#!/bin/bash

delete_file () {
    local file=$1
    if [ ! -f $file ]; then
        echo "delete_file failed. '$file' is not a directory."
        return
    fi
    while true; do
        read -p "Delete the file '$file'? [y/n]" yn
        case $yn in
            [Yy]) rm $file; break;;
            [Nn]) break;;
            *) echo "Please answer [y]es or [n]o.";;
        esac
    done
}

delete_dir () {
    local dir=$1
    if [ ! -d $dir ]; then
        echo "delete_dir failed. '$dir' is not a directory."
        return
    fi
    while true; do
        read -p "Delete the directory '$dir'? [y/n]" yn
        case $yn in
            [Yy]) rm -r $dir; break;;
            [Nn]) break;;
            *) echo "Please answer [y]es or [n]o.";;
        esac
    done
}


for arg in "$@"; do
    if [ -f $arg ]; then
        delete_file $arg
    elif [ -d $arg ]; then
        delete_dir $arg
    else
        echo "Skipping $arg (does not exist)."
    fi 
done
