# PMTools beta  

PMTools is a program for analyzing paleomagnetic data performing a full cycle of paleomagnetic operations (component analysis, direction statistics, computation of poles).
 
It is a beta version, may be various bugs. If you find any bug, please report this ([create an issue](https://github.com/I194/PMTools/issues) in this repo).

---

## Features

### Import and export

PMTools currently supports the following input formats: 
* pmd 
* cit (.sam, not tested) 
* jra (not testing) 
* jr6 (not tested) 
* cit (not tested)
* magic (limited set of params, only measurements, not tested) 
* pmm 
* dir 
* rs3 (not tested) 
* csv & xlsx (internal formats)

Also, thanks to the [paleomagnetism.org](https://paleomagnetism.org/) open source policy, there are import functions for file formats used in some institutions&labs:
* Black Mountain Lab
* Cenieh
* Geological Survay of Finland
* Geological Survay of Norway
* University of Barselona
* University of Helsinki
* University of Montpellier
* University of Oxford
* University of Oslo
* University of Munich
* University of Rennes
* University of Utrecht

However, due to the lack of real examples of files with such formats, they were not added to the PMTools. If you want your format to be added to PMTools - please report this ([create an issue](https://github.com/I194/PMTools/issues) in this repo or write me to i1948374@gmail.com).
 
You can find examples of some input files used in my laboratory and with which PMTools should work correctly  in the [Import_examples](https://github.com/I194/PMTools/tree/main/Import_examples).

Files export in PMTools is possible only in .csv and .xlsx formats. Soon, the export in MagIC format will be implemented (you can already find the export window in the program, but it does not work yet).

### Charts

All charts in PMTools are created using ```highcharts.js```, their appearance is as simple as possible and allows you to use them almost immediately after export as graphic material for presentations and/or publications. 

All charts have their own settings that are called when you right-click on them (context menu).

### Shortcuts

PMTools supports keyboard shortcuts, which you can see in Help> Shortcuts. They are the same as in Enkin's software for DOS.

### Paleomagnetic tests

Paleomagnetic statistical tests (fold test, conglomerate test, reversal test and test for common mean) are implemented, corresponding to the tests from PmagPY (plot analysis notebook).

---
## Documentation

You can find the documentation for PMTools in this repository in the [Manual folder](https://github.com/I194/PMTools/tree/main/Manual). Unfortunately, I have not yet managed to write a full-fledged documentation in English, but it will be added soon. As a brief overview of PMTools you can use my poster about PMTools for MagIC workshop 2021. I apologize for the inconvenience.

--- 
## PMTools install

You can find latest installers of PMTools beta in the [releases page](https://github.com/I194/PMTools/releases).

Mac and Linux versions will be added soon. 

---
## Licensing

The source code for PMTools is licensed under MIT that can be found under the LICENSE file.

---
## Development history and current state

PMTools was originally created as a simple program for component analysis, therefore it was originally written in python3 (as part of my 2019-2020 coursework). However, in February 2020 (1.5 months before the release of PMTools alpha)  v2.0.0 was released. I was extremely impressed with this site - I really liked the graphic component and the idea itself. However, my colleagues for a number of reasons did not satisfied by paleomagnetism.org v2.0.0., and therefore I decided to go further in the development of PMTools and create a new program for the analysis of paleomagnetic data.

Impressed by [paleomagnetism.org](https://paleomagnetism.org/), I decided to create a JS version of PMTools using ```highcharts.js```. However, an important requirement from my colleagues was the autonomy of the program, so I used the ```electron.js``` framework and created a desktop application.

Over the summer of 2020, I created the most of the PMTools functionality that you can see now in the current version of PMTools. Unfortunately, since autumn I could not pay due attention to the development of PMTools due to my studying (I am a 3rd year student now). However, development did not stop, but it was greatly slowed down. In general, since summer 2020, the export of graphics was improved, paleomagnetic statistical tests were implemented, multiple tests of PMTools were carried out (but even more is needed) and many errors were fixed.

Now the main goal is to implement export and full import of the MagIC database format files, so that users can interact with this database with maximum comfort. Unfortunately, due to the exam period, I have even less time to develop PMTools, but I'm gradually going on.

---

## Appreciation 

I would like to express my gratitude to Roman Veselovsky for supervising the creation of PMTools; Alexander Pasenko, Ivan Lebedev and Vladimir Vodovozov for testing PMTools; Nicholas Jarbo for help with the integration with the MagIC database.

I also want to thank the teams of [paleomagnetism.org](https://paleomagnetism.org/) and [PmagPY](https://github.com/PmagPy/PmagPy) for their open source policy, without access to which PMTools development would be much slower.

---

Ivan Efremov

