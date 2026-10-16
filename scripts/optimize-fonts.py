#!/usr/bin/env python3
"""Rebuild public/assets/fonts/*.woff2 from the full Google Fonts latin files in scripts/font-src/.
Keeps every glyph the site can show (Basic Latin, Latin-1 incl. accents, and the punctuation/symbols used:
dashes, quotes, bullet, ellipsis, arrows, star, euro, TM) and limits the weight axis to the range each
@font-face declares (DM Sans 400-700, Manrope 500-800), so rendering is unchanged and the files are ~30% smaller.
Needs: pip install fonttools brotli"""
import io,os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
here=os.path.dirname(os.path.abspath(__file__));out=os.path.join(here,'..','public','assets','fonts')
U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2039-203A,U+2060,U+2190-2193,U+2197,U+2212,U+2304,U+2605,U+20AC,U+2122,U+FEFF"
for name,rng in [('dm-sans-latin-var',(400,700)),('manrope-latin-var',(500,800))]:
    f=TTFont(os.path.join(here,'font-src',name+'.woff2'))
    o=subset.Options();o.layout_features=['*'];o.name_IDs=['*'];o.notdef_outline=True
    s=subset.Subsetter(o);s.populate(unicodes=subset.parse_unicodes(U));s.subset(f)
    b=io.BytesIO();f.flavor=None;f.save(b);b.seek(0)
    f=instancer.instantiateVariableFont(TTFont(b),{'wght':rng})
    f.flavor='woff2';dest=os.path.join(out,name+'.woff2');f.save(dest);print(name,os.path.getsize(dest))
