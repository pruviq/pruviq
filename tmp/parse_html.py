#!/usr/bin/env python3
import sys
from html.parser import HTMLParser

class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ''
        self.in_title = False
        self.desc = ''
        self.hreflang_count = 0
        self.jsonld_count = 0

    def handle_starttag(self, tag, attrs):
        ad = {k.lower(): v for k, v in attrs}
        tag_low = tag.lower()
        if tag_low == 'title':
            self.in_title = True
        if tag_low == 'link' and 'hreflang' in ad:
            self.hreflang_count += 1
        if tag_low == 'script' and ad.get('type', '').lower() == 'application/ld+json':
            self.jsonld_count += 1
        if tag_low == 'meta' and ad.get('name', '').lower() == 'description':
            self.desc = ad.get('content', '')

    def handle_endtag(self, tag):
        if tag.lower() == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data

if __name__ == '__main__':
    data = sys.stdin.read()
    p = MyParser()
    p.feed(data)
    title = p.title.strip()
    desc = p.desc.strip()
    # replace tabs/newlines
    title = title.replace('\t', ' ').replace('\n', ' ')
    desc = desc.replace('\t', ' ').replace('\n', ' ')
    print('\t'.join([title, str(len(title)), desc, str(len(desc)), str(p.hreflang_count), str(p.jsonld_count)]))
