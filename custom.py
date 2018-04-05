import os, re, shutil, json

def load_config(location="mod_config.json"):
    with open(location) as configfile:
        return json.loads(configfile.read())

def get_newest_app_resource_dir(appdir):
    dir = os.listdir(appdir)
    matches = [item for item in dir if re.match(r'([0-9]+\.){3}[0-9]+', item)]
    matches.sort()
    newest_vivaldi = os.path.join(appdir, matches[-1], 'resources', 'vivaldi')
    print("Using Vivaldi %s" % newest_vivaldi)
    return newest_vivaldi

def register_mods(resources_loc):
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

def copy_mods(resources_loc, mod_path, active_mods):
    target_location = os.path.join(resources_loc, 'user_modfiles')
    if os.path.exists(target_location):
        shutil.rmtree(target_location)
        print("Erased old mods")
    os.makedirs(target_location)
    for mod in active_mods:
        mod_file = os.path.join(mod_path, mod)
        if not os.path.exists(mod_file):
            print("/!\\ Could not install mod %s" % mod)
            continue
        shutil.copyfile(mod_file, os.path.join(target_location, mod))
        print("Copied %s" % mod_file)

def update_splash_screen(resources_loc, background, foreground):
    browser_loc = os.path.join(resources_loc, 'browser.html')
    svg_loc = os.path.join(resources_loc, 'resources', 'vivaldi-splash-icon.svg')
    with open(browser_loc, 'r') as htmlfile:
        html_contents = htmlfile.read()
    with open(svg_loc, 'r') as svgfile:
        svg_contents = svgfile.read()
    print("Updating browser splash background: %s" % background)
    html_contents = re.sub("background-color: .+;", 'background-color: %s;' % background, html_contents)
    with open(browser_loc, 'w') as htmlfile:
        htmlfile.write(html_contents)
    print("Updating browser splash foreground: %s" % foreground)
    svg_contents = re.sub('g fill=".+"', 'g fill="%s"' % foreground, svg_contents)
    with open(svg_loc, 'w') as svgfile:
        svgfile.write(svg_contents)

config = load_config()
resources_loc = get_newest_app_resource_dir(config["application_path"])
mod_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mods')
copy_mods(resources_loc, mod_path, config["active_mods"])
register_mods(resources_loc)
update_splash_screen(resources_loc, config["splash_bg"], config["splash_fg"])
