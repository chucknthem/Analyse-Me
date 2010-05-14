#!/bin/sh
working_dir=`pwd`
cd ..

version=`grep 'version' $working_dir/manifest.json | tr '"' '\n' |grep '[0-9]'`

zip -r $working_dir/analyzeMe-$version.zip $working_dir -x \*docs\* -x \*examples* -x \*build.sh -x \*.git\* -x \*RGraph/images\* -x \*analyzeMe\*.zip\* -x \*Makefile\* -x \*excanvas.original.js
