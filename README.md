# PMTools beta  

![image](https://user-images.githubusercontent.com/49840874/140029548-2db9bc4a-d16a-4b08-a336-fd1c06f22d50.png)

PMTools is a paleomagnetic data analysis program, performing a full-cycle of paleomagnetic operations: 
1. **PCA page**: component analysis
2. **DirStat page**: direction statistics
3. **Poles page**: poles computation
 
:exclamation: It is a beta version, may be various issues. If you find any issue, please report this ([create an issue](https://github.com/I194/PMTools/issues)).

How to start
---
You can download `PMTools-beta-setup-v*.exe` file from [releases page](https://github.com/I194/PMTools/releases) and simply install it.

:exclamation: Latest versions may be unstable and have unknown issues.

Source code and Build
---
You can clone this repo and start the project with `npm start`.

:exclamation: **Source code of PMTools is overly complex** and it is my fault. I was able to figure it out only after 0.5 year of development. To solve this problem is one of my nearest and hardest future plans. 

Technology stack:
1. **JavaScript/HTML/CSS**
2. **Electron.js**
3. **Highcharts.js**

## Features

### Import and export

PMTools currently supports the following input formats: 
* pmd 
* jra (not testing) 
* jr6 (not tested) 
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

PMTools supports keyboard shortcuts, which you can see in `Help>Shortcuts`. They are the same as in Enkin's software for DOS.

### Paleomagnetic tests

Paleomagnetic statistical tests (fold test, conglomerate test, reversal test and test for common mean) are implemented, corresponding to the tests from PmagPY (plot analysis notebook).

---
## Documentation

You can find the documentation for PMTools in this repository in the [Manual folder](https://github.com/I194/PMTools/tree/main/Manual). Unfortunately, I have not yet managed to write a full-fledged documentation in English. As a brief overview of PMTools you can use my poster about PMTools for MagIC workshop 2021. I apologize for the inconvenience.

---
## Licensing

The source code for PMTools is licensed under MIT that can be found under the LICENSE file.

---
## Development history and current state

PMTools was originally created as a simple program for component analysis, therefore it was originally written in **python3** (as part of my 2019-2020 termwork). However, in February 2020 (1.5 months before the release of PMTools alpha) [paleomagnetism.org](https://paleomagnetism.org/) v2.0.0 was released. I was extremely impressed with this platform - I really liked the implementation of **highcharts.js** and the idea itself. However, my colleagues for a number of reasons did not satisfied by paleomagnetism.org v2.0.0., and therefore I decided to go further in the development of **PMTools** and create a new level program for the analysis of paleomagnetic data.

Impressed by [paleomagnetism.org](https://paleomagnetism.org/), I decided to create a **JavaScript** version of PMTools using ```highcharts.js```. However, an important requirement from my colleagues was the autonomy of the PMTools, so I decided to use the ```electron.js``` framework for desktop application.

Over the summer of 2020, I created the most of the PMTools functionality that you can see now in the current version of PMTools. Unfortunately, since then I could not pay due attention to the development of PMTools due to my studying and other problems. However, development did not stop, but it was greatly slowed down. In general, since summer 2020, the export of graphics was improved, paleomagnetic statistical tests were implemented, multiple tests of PMTools were carried out (but even more is needed) and many errors were fixed.

---

## Appreciation 

I would like to express my gratitude to **Roman Veselovsky** for supervising the creation of PMTools; Alexander Pasenko, Ivan Lebedev and Vladimir Vodovozov for testing PMTools; 
Nicholas Jarboe for help with the integration with the MagIC database.

I also want to thank the teams of [paleomagnetism.org](https://paleomagnetism.org/) and [PmagPY](https://github.com/PmagPy/PmagPy) for their open source policy, without access to which PMTools development would be much slower.

Future plans
---

In future I see PMTools as **React Native** app with **TypeScript** and **Redux**, and also as **React/Redux/TypeScript** website. I don't know when I'll decide to do it, but I think it's really important becouse with this configuration and good documentation PMTools can be maintained by other developers as long as it takes. So it's really important for paleomagnetic community.

