import os, re, shutil

def get_newest_app_dir():
    appdir = 'C:\\Users\\lonm\\AppData\\Local\\Vivaldi\\Application'
    dir = os.listdir(appdir)
    matches = [item for item in dir if re.match('([0-9]+\.){3}[0-9]+', item)]
    matches.sort()
    return appdir + '\\' + matches[-1] + '\\'
    
def update_resource_file(app_dir):
    resource_location = app_dir + 'resources\\vivaldi\\browser.html'
    with open(resource_location, 'r') as htmlfile:
        contents = htmlfile.read()
    if contents.find('mystyles.css') != -1:
        return
    contents = contents.replace('</head>', '  <link rel="stylesheet" href="style/mystyles.css" />\n  </head>')
    with open(resource_location, 'w') as htmlfile:
        htmlfile.write(contents)

def copy_style(app_dir):
    resource_location = app_dir + 'resources\\vivaldi\\style\\mystyles.css'
    template_file = 'mystyles.css'
    shutil.copyfile(template_file, resource_location)

loc = get_newest_app_dir()
update_resource_file(loc)
copy_style(loc)

    
