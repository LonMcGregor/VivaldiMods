#! /usr/bin/python3
# THANK YOU JAMES!!!!!!! https://github.com/james-bird/layer-to-svg/blob/master/layer2svg.py
import xml.etree.ElementTree as ET
import copy
import sys
import subprocess

tree = ET.parse(sys.argv[1])
root = tree.getroot()
listoflayers=[]
for g in root.findall('{http://www.w3.org/2000/svg}g'):
    name = g.get('{http://www.inkscape.org/namespaces/inkscape}label')
    listoflayers.append(name)
try:
    listoflayers.remove('background')
except ValueError:
    print("No background")
for counter in range(len(listoflayers)):
    james=listoflayers[:]
    temp_tree = copy.deepcopy(tree)
    del james[counter]
    print(listoflayers[counter])
    temp_root = temp_tree.getroot()
    for g in temp_root.findall('{http://www.w3.org/2000/svg}g'):
        name = g.get('{http://www.inkscape.org/namespaces/inkscape}label')
        if name in james:
            temp_root.remove(g)
    temp_tree.write(listoflayers[counter]+'.svg')
    # assume inkscape is on path
    proc = subprocess.Popen("inkscape.exe" + " --file="+listoflayers[counter]+".svg --without-gui --export-dpi=192 --export-png="+listoflayers[counter]+".png", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
