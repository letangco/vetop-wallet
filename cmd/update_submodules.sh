#!/bin/bash
echo "Good Day Friend, building all submodules while checking out from RELEASE branch."

git submodule update --init --recursive
git submodule foreach git checkout release
git submodule foreach git pull origin release
