@echo off
FOR /D %%i IN (..\1.*) DO copy browser.html %%i\resources\vivaldi\browser.html /Y
FOR /D %%i IN (..\1.*) DO copy mystyles.css %%i\resources\vivaldi\style\mystyles.css /Y