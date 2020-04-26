import os, re, shutil, json, argparse
import logging as log

# Parse arguments
parser = argparse.ArgumentParser(description='Manage installing vivaldi mods')
group = parser.add_mutually_exclusive_group(required=True)
parser.add_argument('-v', '--verbose', action='count', help='Give more verbose output')
group.add_argument('-u', '--uninstall', action='store_true', help='Uninstall mods')
group.add_argument('-i', '--install', action='store_true', help='Install mods')
parser.add_argument('configfile', type=argparse.FileType('r'), help='The configuration file to use')
parser.add_argument('-c', '--css', action='store_false', help='Dont combine all css files into one')
args = parser.parse_args()

# Prep logger
if args.verbose and args.verbose >= 2:
    log.basicConfig(format='%(levelname)s - %(message)s', level=log.DEBUG)
elif args.verbose == 1:
    log.basicConfig(format='%(levelname)s - %(message)s', level=log.INFO)
else:
    log.basicConfig(format='%(levelname)s - %(message)s', level=log.WARNING)
log.debug('Using very verbose logging')
log.info('Using verbose logging')

# Read from config file
with args.configfile as configfile:
    CONFIG = json.loads(configfile.read())

# Gather directories and paths
def get_app_resource_dir():
    '''Get the vivaldi resource directory.
    This assumes that the installer has already removed any older versions'''
    if CONFIG['application_path'][0] == '/':
        # linux user, with / as root directory, so don't try and find the version
        return os.path.join(CONFIG['application_path'], 'resources', 'vivaldi')
    else:
        dir = os.listdir(CONFIG['application_path'])
        matches = [item for item in dir if re.match(r'([0-9]+\.){3}[0-9]+', item)]
        newest_vivaldi = os.path.join(CONFIG['application_path'], matches[0], 'resources', 'vivaldi')
        log.info('Using Vivaldi %s' % newest_vivaldi)
        return newest_vivaldi

RESOURCE_DIRECTORY = get_app_resource_dir()
BROWSER_HTML = os.path.join(RESOURCE_DIRECTORY, 'browser.html')
BROWSER_HTML_BAK = os.path.join(RESOURCE_DIRECTORY, 'browser.html.bak')
PAGE_ACTION_DIR = os.path.join(RESOURCE_DIRECTORY, 'user_files')
MODS_DIR = os.path.join(RESOURCE_DIRECTORY, 'mods')
SPLASH_SVG = os.path.join(RESOURCE_DIRECTORY, 'resources', 'vivaldi-splash-icon.svg')
PAGE_ACTION_INSTALL_LOG = os.path.join(RESOURCE_DIRECTORY, 'page_action_install.log')
SOURCE_MODS_DIR = os.path.join(os.path.dirname(__file__), 'mods')
SOURCE_ACTIONS_DIR = os.path.join(os.path.dirname(__file__), 'pageActions')
COMBINED_STYLE_NAME = 'lonm_mod_combined_styles.css'
COMBINED_STYLE_PATH = os.path.join(MODS_DIR, COMBINED_STYLE_NAME)

def install():
    '''Installs mods, and makes a backup of browser.html if needed'''
    if os.path.exists(MODS_DIR):
        uninstall()
    else:
        backup_html()
    log.warning('Installing mods')
    install_mods()
    install_page_actions()
    update_splash_screen(CONFIG['splash_bg'], CONFIG['splash_fg'])

def uninstall():
    '''Uninstalls all changes and mods'''
    log.warning('Uninstalling old mods')
    restore_html()
    if os.path.exists(MODS_DIR):
        shutil.rmtree(MODS_DIR)
    else:
        log.warning('No mods to remove')
    uninstall_page_actions()
    update_splash_screen('#d4d4d4', 'rgba(0, 0, 0, 0.1)')

def backup_html():
    '''Make a backup of the browser.html'''
    log.info('Backing up browser.html')
    shutil.copyfile(BROWSER_HTML, BROWSER_HTML_BAK)

def restore_html():
    '''Restore the backup of the browser.html'''
    log.info('Restoring up browser.html')
    if os.path.exists(BROWSER_HTML_BAK):
        shutil.copyfile(BROWSER_HTML_BAK, BROWSER_HTML)
    else:
        log.error('No html back up to restore')

def install_page_actions():
    '''Installs the page actions
    Creates the log if it doesn't exist'''
    if not os.path.exists(PAGE_ACTION_INSTALL_LOG):
        with open(PAGE_ACTION_INSTALL_LOG, 'w') as palog:
            palog.write('')
    for action in CONFIG['page_actions']:
        install_one_page_action(action)

def install_one_page_action(action):
    '''Installs a single page action'''
    try:
        action_source_path = os.path.join(SOURCE_ACTIONS_DIR, action)
        action_dest_path = os.path.join(PAGE_ACTION_DIR, action)
        shutil.copyfile(action_source_path, action_dest_path)
        log.info('Installed PA %s' % action)
        with open(PAGE_ACTION_INSTALL_LOG, 'a') as palog:
            palog.write(action+'\n')
    except:
        log.error('Failed to install PA &s' % action)

def uninstall_page_actions():
    '''Given the page action log of installed, delete
    each of the added page actions, and then the log itself'''
    if not os.path.exists(PAGE_ACTION_INSTALL_LOG):
        log.warning('Tried to uninstall all page actions, but none are already installed')
        return
    log.info('Uninstalling page actions')
    with open(PAGE_ACTION_INSTALL_LOG, 'r') as palog:
        for action in palog:
            if action.strip() != '':
                uninstall_page_action(action.strip())
    os.remove(PAGE_ACTION_INSTALL_LOG)

def uninstall_page_action(action):
    '''Uninstall one page action. Updating of log
    will be handled elsewhere'''
    try:
        action_path = os.path.join(PAGE_ACTION_DIR, action)
        os.remove(action_path)
        log.info('Uninstalled PA %s' % action)
    except:
        log.error('Failed to uninstall PA %s' % action)

def install_mods():
    '''Install all of the specified mods, as well as
    any specified mod dependencies'''
    if not os.path.exists(MODS_DIR):
        os.makedirs(MODS_DIR)
    if args.css:
        css = combine_css_mods()
        if os.path.exists(COMBINED_STYLE_PATH):
            log.error('Conflict when combining CSS mods - a mod already exists called %s' % COMBINED_STYLE_NAME)
        with open(COMBINED_STYLE_PATH, 'w') as css_file:
            css_file.write(css)
            log.debug('Wrote combined css')
        if register_mod(COMBINED_STYLE_NAME):
            log.info('Installed css mods as a single file')
    for mod in CONFIG['mods']:
        if args.css and is_css(mod):
            continue
        if copy_mod_file(mod) and register_mod(mod):
            log.info('Installed mod %s' % mod)
    for dep in CONFIG['mod_dependencies']:
        copy_mod_file(dep)

def copy_mod_file(mod):
    '''Copy a single mod file'''
    try:
        mod_src = os.path.join(SOURCE_MODS_DIR, mod)
        mod_dest = os.path.join(MODS_DIR, mod)
        shutil.copyfile(mod_src, mod_dest)
        log.debug('Copied mod %s' % mod)
        return True
    except:
        log.error('Failed to copy mod %s' % mod)
        return False

def register_mod(mod):
    '''Register a mod to browser.html'''
    try:
        with open(BROWSER_HTML, 'r') as htmlfile:
            contents = htmlfile.read()
        if is_css(mod):
            contents = contents.replace('</head>', '''<link rel="stylesheet" href="mods/%s" />
</head>''' % mod)
        elif is_js(mod):
            contents = contents.replace('</body>', '''<script src="mods/%s"></script>
</body>''' % mod)
        else: # Could also add svg case for path defs if needed
            log.warning('Cannot register mod type %s' % mod)
            return
        with open(BROWSER_HTML, 'w') as htmlfile:
            htmlfile.write(contents)
        log.debug('Registered mod %s' % mod)
        return True
    except:
        log.error('Failed to register mod %s' % mod)
        return False

def update_splash_screen(background, foreground):
    '''Change the colours of the splash screen'''
    with open(BROWSER_HTML, 'r') as htmlfile:
        html_contents = htmlfile.read()
    with open(SPLASH_SVG, 'r') as svgfile:
        svg_contents = svgfile.read()
    log.debug('Updating browser splash background: %s' % background)
    html_contents = re.sub('background-color: .+;', 'background-color: %s;' % background, html_contents)
    with open(BROWSER_HTML, 'w') as htmlfile:
        htmlfile.write(html_contents)
    log.debug('Updating browser splash foreground: %s' % foreground)
    svg_contents = re.sub('g fill=".+"', 'g fill="%s"' % foreground, svg_contents)
    with open(SPLASH_SVG, 'w') as svgfile:
        svgfile.write(svg_contents)
    log.info('Updated splash screen')

def combine_css_mods() :
    '''Combine all of the css mods and
    return as a long string
    Don't use mod dependencies'''
    css = ''
    for mod in CONFIG['mods']:
        if is_css(mod):
            css += '''
/** --- %s --- **/
''' % mod
            mod_path = os.path.join(SOURCE_MODS_DIR, mod)
            with open(mod_path, 'r') as cssmodfile:
                css += cssmodfile.read()
    return css

def is_js(mod):
    '''is this a javascript mod'''
    return mod[-3:] == '.js'

def is_css(mod):
    '''is this a css style mod'''
    return mod[-4:] == '.css'

# Run the program
if args.install:
    install()
elif args.uninstall:
    uninstall()
