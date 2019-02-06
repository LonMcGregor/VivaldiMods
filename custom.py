import os, re, shutil, json, glob, sys

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
    if not os.path.exists(target_location):
        os.makedirs(target_location)
    successful = []
    for modfile in glob.glob(os.path.join(mod_path, "*")):
        mod = modfile.split(os.path.sep)[-1]
        modname = mod.split(".")[0]
        if modname in active_mods:
            shutil.copyfile(modfile, os.path.join(target_location, mod))
            print("Copied mod %s" % mod)
            if modname not in successful:
                successful.append(modname)
    for mod in active_mods:
        if mod not in successful:
            print("/!\\ Could not install mod %s" % mod)
            input("Press any key to continue...")

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

def copy_page_actions(resources_loc, page_action_path, active_actions):
    page_action_install_log = os.path.join(resources_loc, 'page_action_install.log')
    target_location = os.path.join(resources_loc, 'user_files')
    if not os.path.exists(target_location):
        os.makedirs(target_location)
    successful = []
    already_recorded = []
    if os.path.exists(page_action_install_log):
        with open(page_action_install_log, "r") as log:
            installed = log.read()
            already_recorded = installed.split("\n")
    for actionfile in glob.glob(os.path.join(page_action_path, "*")):
        action = actionfile.split(os.path.sep)[-1]
        if action in active_actions:
            shutil.copyfile(actionfile, os.path.join(target_location, action))
            print("Copied PA %s" % action)
            if action not in successful:
                successful.append(action)
    with open(page_action_install_log, "r+") as log:
        for pa in successful:
            if pa not in already_recorded:
                log.write(pa+"\n")
    for action in active_actions:
        if action not in successful:
            print("/!\\ Could not install page action %s" % action)
            input("Press any key to continue...")


def backup_html(resources_loc):
    """Run this BEFORE install mods"""
    print("Backing up browser.html")
    html_loc = os.path.join(resources_loc, "browser.html")
    html_dest = os.path.join(resources_loc, "browser.html.bak")
    shutil.copyfile(html_loc, html_dest)

def restore_html(resources_loc):
    print("Restoring up browser.html")
    html_loc = os.path.join(resources_loc, "browser.html")
    html_dest = os.path.join(resources_loc, "browser.html.bak")
    shutil.copyfile(html_dest, html_loc)

def remove_added_page_actions(resources_loc):
    print("Removing installed page actions")
    page_action_install_log = os.path.join(resources_loc, 'page_action_install.log')
    if not os.path.exists(page_action_install_log):
        return
    page_actions = []
    with open(page_action_install_log, "r") as log:
        installed = log.read()
        page_actions = installed.split("\n")
    target_location = os.path.join(resources_loc, 'user_files')
    for pa in page_actions:
        if pa != "":
            path_to_pa = os.path.join(target_location, pa)
            os.remove(path_to_pa)
            print("Removed "+pa)
    with open(page_action_install_log, "w") as log:
        log.write("")


def uninstall_mods():
    config = load_config()
    resources_loc = get_newest_app_resource_dir(config["application_path"])
    restore_html(resources_loc)
    update_splash_screen(resources_loc, "#d4d4d4", "rgba(0, 0, 0, 0.1)")
    remove_added_page_actions(resources_loc)

def install_mods():
    config = load_config()
    resources_loc = get_newest_app_resource_dir(config["application_path"])
    backup_html(resources_loc)
    mod_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mods')
    page_action_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pageActions')
    copy_mods(resources_loc, mod_path, config["active_mods"])
    register_mods(resources_loc)
    copy_mods(resources_loc, mod_path, config["mod_dependencies"])
    update_splash_screen(resources_loc, config["splash_bg"], config["splash_fg"])
    copy_page_actions(resources_loc, page_action_path, config["active_page_actions"])

args = sys.argv
if len(sys.argv) > 1 and sys.argv[1] in ["uninstall", "u"]:
    uninstall_mods()
else:
    install_mods()
