# VivaldiMods
Stuff for Vivaldi Browser, Bringing together various gists into a repo

## Installing Mods or Page Actions
1. Find the file called `config.json`, with the following inside it:
```
{
    "application_path": "C:\\Program Files\\Vivaldi\\Application",
    "mods": [
        "betterNotes.css",
        "betterNotes.js",
        "always_small_tab_audio.css",
        "autoSaveSessions.js",
        "bluescreen.css"
    ],
    "mod_dependencies": [
        "betterNotesEditor.css",
        "betterNotesEditor.html",
        "betterNotesEditor.js",
        "betterNotesEditor.png"
    ],
    "page_actions": [
        "Image_Chequerboard.css"
    ],
    "splash_fg": "#ee77d9",
    "splash_bg": "#444"
}
```

2. Make sure to set the values as you require them:
    * **application_path** should point to where your vivaldi is installed
    * **mods** is a list of css or js files that need to be added to `browser.html`. These will be added in the order that you specify, which is important for CSS mods that have cascading rules
    * **mod_dependencies** is a list of any additional files you need to add in order to use your mods, but that you don't want to add to the actual browser. You won't need these except for very complex mods
    * **page_actions** is a list of page actions you want to add
    * **splash_fg** is a hex colour value for the splash screen's icon
    * **splash_bg** is a hex colour value for the splash screen's background

3. Run the command `python3 custom.py -i config.json` - Note that if you need admin permission to write to the Vivaldi directory, this script also requires it
4. Restart vivaldi if it was open

### Combining CSS
By default, the mod will combine all css files into a single stylesheet. If you would prefer not to do this, use the additional `-c` argument when running the script.

## Uninstall Mods or Page Actions
* Run the command `python3 custom.py -u config.json` - this will remove all mods and page actions
* Alternatively, you can keep multiple json files, and when you install a different one, it will remove any changes and only keep the ones you specify

## Speed Dial Thumbnails
There are some speed dial thumbnails in the *thumbs* folder.

## Custom Profiles
This can be used to run different copies of Vivaldi simultaneously by using different user data directories. Regular profiles as set within Vivaldi can't be run concurrently, but user data dirs can.
1. Run the `vivaldiprof.cmd` script
2. Enter the name of a profile to use
3. Press enter
