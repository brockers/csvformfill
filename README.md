# csvformfill


A Firefox plugin to copy data from a CSV file into online forms.

## Development Setup

To prep for development create a firefox development profile (do NOT use your 
existing profile) and create a new text file named **csvformfill@rockerssoft.org** 
in the **extensions** folder of the new profile.  In that file place a single line 
that is the full path to your local cvsformfill repository.  Something like:

```
/home/username/cvsformfill
```

and then start firefox in your new profile.  The toolbar should be there.

## Build

* Create the csvformfill.xpi file.  If you are using Linux you can simply run ''zip -r csvformfill.xpi *''
* Install csvformfill.xpi in firefox.
* Create a csv file in LibreOffice or Excel.  
* The first row should match the input form elements ids or names.  All remaining rows will be treated as content to be "pasted" into the form when selected.

## Reference

* [http://www.borngeek.com/firefox/toolbar-tutorial/](Firefox Toolbar Plugin Tutorial, by BornGeek)