import os
import urllib.request
from html.parser import HTMLParser

word = ""
definitions = []
current_definition = ""

class WereDone(Exception):
    msg = "done"

class MyHTMLParser(HTMLParser):
    state = ""
    depth = -1
    def handle_starttag(self, tag, attrs):
        if tag == "h1":
            self.state = "WORD"
        if self.state == "DEF":
            if tag == "h2":
                return
            elif tag == "p":
                self.state = "DEFITEM"
            else:
                raise WereDone
        for name, val in attrs:
            if name=="class" and val=="main-attr":
                self.state = "ATTR"
            if name=="class" and val=="word-syllables":
                self.state = "ATTR"
            if name=="class" and val=="wod-definition-container":
                self.state = "DEF"
            
                
    def handle_endtag(self, tag):
        global definitions, current_definition
        if self.state=="WORD" and tag == "h1":
            self.state = ""
        if self.state=="ATTR" and tag == "span":
            self.state = ""
        if self.state=="DEFITEM" and tag == "p":
            self.state = "DEF"
            definitions.append(current_definition)
            current_definition = ""

    def handle_data(self, data):
        global word, definitions, current_definition
        if self.state == "WORD":
            word += data
        if self.state == "ATTR":
            definitions.append(data)
        if self.state == "DEFITEM":
            current_definition += data

parser = MyHTMLParser()

def renew_word():
    with urllib.request.urlopen("https://www.merriam-webster.com/word-of-the-day") as mw_response:
        mw_html = mw_response.read().decode("utf-8")
    try:
        parser.feed(mw_html)
    except WereDone:
        return word, definitions

def generate_css(word, definitions):
    wotd = word
    for x in definitions:
        wotd += "\\a   %s" % str(x)
    return """#app:only-child:before {
	content: '%s';
    font-weight: bold;
    font-size: 100px;
	position: fixed;
	top: 0px;
    white-space: pre;
}""" % wotd

if __name__ == '__main__':
    word, definitions = renew_word()
    css = generate_css(word, definitions)
    print(word, definitions)
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "custom", "word-of-the-day.css"), "w") as wotd:
        wotd.write(css)
