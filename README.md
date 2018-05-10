# VivaldiMods
Stuff for Vivaldi Browser, Bringing together various gists into a repo

## Installing Mods
1. Make a file called `mod_config.json`, with the following inside it:
```
{
    "application_path": "C:\\Program Files\\Vivaldi\\Application",
    "active_mods": [
        "addressbar_button_order",
    ],
    "splash_fg": "#67d0ea",
    "splash_bg": "#222"
}
```

2. Make sure to set the values as you require them. Mods are named as they appear in the mods folder. As some mods may have both a `.js` and `.css` component, you just need to give a name without the extension, and any files that have this name will be installed as mods.
3. Run the command `python3 custom.py` - Note that if you need admin permission to write to the Vivaldi directory, this script also requires it

## Speed Dial Thumbnails
There are some speed dial thumbnails in the *thumbs* folder.

## Custom Profiles
This can be used to run different copies of Vivaldi simultaneously by using different user data directories. Regular profiles as set within Vivaldi can't be run concurrently, but user data dirs can.
1. Run the `vivaldiprof.cmd` script
2. Enter the name of a profile to use
3. Press enter
