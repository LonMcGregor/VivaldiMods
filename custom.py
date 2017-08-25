import os, re, shutil

def get_newest_app_resource_dir():
    appdir = os.path.join('C:\\','Users','lonm','AppData','Local','Vivaldi','Application')
    dir = os.listdir(appdir)
    matches = [item for item in dir if re.match('([0-9]+\.){3}[0-9]+', item)]
    matches.sort()
    return os.path.join(appdir, matches[-1], 'resources', 'vivaldi')
    
def update_browser(resources_loc):
    browser_loc = os.path.join(resources_loc, 'browser.html')
    modfiles_loc = os.path.join(resources_loc, 'user_modfiles')
    with open(browser_loc, 'r') as htmlfile:
        contents = htmlfile.read()
    for file in os.listdir(modfiles_loc):
        if contents.find(file) != -1:
            print("Already Registered %s" % file)
            continue
        if file[::-1][0:4] == "ssc.":
            contents = contents.replace('</head>', '<link rel="stylesheet" href="user_modfiles/%s" /></head>' % file)
        if file[::-1][0:3] == "sj.":
            contents = contents.replace('</body>', '<script src="user_modfiles/%s"></script></body>' % file)
        print("Registered %s" % file)
    with open(browser_loc, 'w') as htmlfile:
        htmlfile.write(contents)
        print("Updated browser.html")

def copy_files(resources_loc, own_files_loc):
    target_location = os.path.join(resources_loc, 'user_modfiles')
    shutil.rmtree(target_location)
    print("Erased old files")
    os.makedirs(target_location)
    for file in os.listdir(own_files_loc):
        shutil.copyfile(os.path.join(own_files_loc, file), os.path.join(target_location, file))
        print("Copied %s" % file)


resources_loc = get_newest_app_resource_dir()
own_files_loc = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'custom')
print("Working in %s" % resources_loc)
copy_files(resources_loc, own_files_loc)
update_browser(resources_loc)

    
