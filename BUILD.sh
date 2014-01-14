#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
build() {
	_home=$1
	_squish=$_home/third_party/sqUIsh
	
	cd $_squish
	
	# Build imgbit
	./sqUI.sh $_home/build/imgbit.js.list
	./sqUI.sh $_home/build/imgbit.css.list
	mv $_squish/build/imgbit* $_home/
	
	# Build imgspect
	./sqUI.sh $_home/build/imgspect.js.list
	./sqUI.sh $_home/build/imgspect.css.list
	mv $_squish/build/imgspect* $_home/
}
build $DIR