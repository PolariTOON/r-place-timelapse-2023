#!/bin/bash
ffmpeg -framerate 5 -i frames/frame-%03d.png -c:v libx264 -r 5 -pix_fmt yuv420p timelapse.mp4
