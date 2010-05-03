#!/bin/sh
working_dir=`pwd`
cd ..

zip -r $working_dir/analyzeMe.zip $working_dir -x \*docs\* -x \*examples* -x \*build.sh -x \*.git\* -x \*RGraph/images\* -x \*analyzeMe.zip\* \*Makefile\*
