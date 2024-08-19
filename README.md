# lecture_to_PDF
Web application to extract the presentation slides from a video or online video conference.


## How to use
Clone the repository and open `index.html` in your web browser (tested in Google Chrome and Safari).
Press the start button to begin.

## How it started
This project began in the summer of 2020 when the COVID-19 pandemic foreced my college courses to an online format. Presentation slides in online classes became an essential learning resource, especially  with professors' annotations which can be greatly valuable later.

The primary objective of this project is to automatically extract presentation slides from online meetings, ensuring that annotations remain intact. The process should be fully automated, requiring at most a one-time configuration. Additionally, we also want to leverage as much of the browsers inbuilt capabilities as possible.

## Challenge

Classes occur in a variety of hosts (Google Meet, Zoom, MS Teams, etc). 
Each can have multiple layouts. We need to extract the main video stream from each.
This is currently done manually, and a GUI element should be created to enable this.

The slide capture itself needs to happen. 
We need to understand when new slides are brought up, ignore any moving objects in front of it, update the saved slide when annotations are added.
Currently a heuristic method is used that depends on defining a background and measuring changing pixels.

Online classes are hosted on various platforms such as Google Meet, Zoom, and Microsoft Teams, each offering multiple layouts. 
The challenge is to consistently extract the main video stream from these diverse setups. Currently, this is done manually, but a graphical user interface (GUI) should be developed to streamline this process.

The core task of slide capture needs to happen by itself. It requires the ability to detect when new slides appear, ignore any moving objects that might obscure the slide, and update the saved slide when annotations are added. Presently, a heuristic approach is employed, which involves defining a background and monitoring pixel changes.
