import { fabric } from 'fabric';
import { writeFileSync } from 'fs';
import opentype from 'opentype.js';
import { optimize } from 'svgo';

//#region

// NOTES:
// UNDERSTAND HOW FONTS WORKS (truefonts):
// - https://freetype.org/freetype2/docs/

// OPENTYPE-JS
// https://sparanoid.com/lab/opentype-features/ -- List of features

// KERGNING:
// - https://freetype.org/freetype2/docs/glyphs/glyphs-4.html

// GLYPH
// - https://freetype.org/freetype2/docs/glyphs/glyphs-3.html

// LINE HEIGHT:
// - https://freetype.org/freetype2/docs/tutorial/step2.html#section-3 -- line height stuff
// - https://freetype.org/freetype2/docs/glyphs/glyphs-3.html#:~:text=a%20positive%20value.-,Linegap,-The%20distance%20that -- formula
// - https://github.com/opentypejs/opentype.js/issues/163 -- github issue about line height -- git issue about line height
// - https://www.w3.org/TR/CSS2/visudet.html#line-height - how most browsers handles line height

// MS
// - https://www.microsoft.com/typography/otspec/os2.htm#fc - fonts specifictation
// - https://docs.microsoft.com/en-us/typography/opentype/spec/features_ko#medi -- css font features

// ADOBE
// - https://helpx.adobe.com/fonts/using/open-type-syntax.html

//#endregion

const maxWidth = 300;
const fontSize = 15;
const tracking = -5;
const lineSpacing = 3;
const letterSpacing = 0;
const kerning = false;
const alignment: any = 'right';

const fontLocation = './fonts/Roboto-Regular.ttf';

const copy = `Lorem \nIpsum is\n simply dummy text\n of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived\n not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised\n in the 1960s with the \nrelease of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software \nlike Aldus PageMaker including versions of Lorem Ipsum.`;

const getLines = (currentLine: string, font: opentype.Font): string[] => {
  const words = currentLine.split(' ').filter((word: string) => word !== ''); // exclude empty string as opentype renders them with the matchinf glyph

  let currentLineWords: string[] = [];
  let lines: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const tmpLine = `${currentLineWords.join(' ')} ${words[i]}`;

    // using advancedWidth as it includes the white space aroudn the word/glyph (ascent and descent)
    const advancedWidth = font.getAdvanceWidth(tmpLine, fontSize, {
      kerning,
      tracking,
    });

    if (words[i] === 'content') {
      console.log('advancedWidth > maxWidth', advancedWidth > maxWidth);
      console.log(
        'i === words.length - 1 && advancedWidth < maxWidth',
        i === words.length - 1 && advancedWidth < maxWidth
      );
    }

    if (advancedWidth > maxWidth) {
      // text is overflowing
      lines.push(currentLineWords.join(' '));
      currentLineWords = [words[i]];
    } else if (i === words.length - 1 && advancedWidth < maxWidth) {
      lines.push([...currentLineWords, words[i]].join(' '));
    } else {
      currentLineWords.push(words[i]);
    }
  }

  return lines;
};

const optimizeSvg = (svg: string) => {
  const optimizedSvg: any = optimize(svg, {
    plugins: [
      'preset-default',
      {
        name: 'mergePaths',
        active: true,
      },
    ],
  });

  return optimizedSvg.data;
};

const getTextAsSvg = (lines: string[], font: opentype.Font) => {
  const canvas = new fabric.StaticCanvas('c');
  let canvasHeight = 0;

  lines.forEach((line, index) => {
    const yPos = (fontSize + lineSpacing) * (index + 1) - fontSize / 2; // font/2 removes the invisible space around the svg

    const path = font.getPath(line, 0, yPos, fontSize, {
      kerning,
      tracking,
      letterSpacing,
    });

    const cPath = new fabric.Path(path.toPathData(1), {
      fill: 'currentColor',
    });

    canvasHeight = cPath.getBoundingRect().top + fontSize;
    canvas.add(cPath);

    if (alignment === 'center') {
      canvas.centerObjectH(cPath);
    }

    if (alignment === 'right' && cPath.width && cPath.scaleX) {
      cPath.set({
        left: canvas.getWidth() - (cPath.width + 1) * cPath.scaleX,
      });
    }
  });

  const canvasWidth = canvas.getWidth();

  return canvas.toSVG({
    width: canvasWidth,
    height: canvasHeight,
    viewBox: {
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    },
  });
};

const writeFile = (svg: string) => {
  writeFileSync(
    `./output/fabric.html`,
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <style>
          @font-face {
            font-family: Font;
            src: url('${fontLocation}');
          }
    
          * {
            margin: 0;
            padding: 0;
          }

          body {
            display: flex;
            align-items: center;
            justify-content: center;
            align-content: center;
            width: 100vw;
            height: 100vh;
          }
    
          h1 {
            font-family: Font;
            margin-bottom: 10px;
          }
    
          div {
            outline: 1px solid teal;
            width: 300px;
          }
    
          p {
            position: relative;
            box-sizing: border-box;
            text-align: left;
            font-family: Font;
            letter-spacing: normal;
            font-size: ${fontSize}px;
            line-height: ${fontSize + lineSpacing}px;
            margin-bottom: 50px;
            text-align: ${alignment};
            top: 0px;
            -webkit-font-smoothing: antialiased;
          }
    
          svg {
            margin-bottom: 0;
            fill: red;
            stroke: none;
          }
    
          path {
            color: currentColor !important
          }
        </style>
        <div>
          <h1>Copy</h1>
          <p>
            ${copy.replace(/\n/g, '<br />')}
          </p>

          <h1>SVG</h1>
          ${svg}

        </div>
      </body>
    </html>
    `
  );
};

const init = () => {
  console.log('LOADING FONT');
  const font = opentype.loadSync(fontLocation);

  console.log('WRAPPING TEXT');
  const hardLines = copy.split('\n'); // respect the hard coded line breaks, should split by <br /> and <br> as well but don't know the regex for it :D

  let lines: string[] = [];
  for (let i = 0; i < hardLines.length; i++) {
    lines = [...lines, ...getLines(hardLines[i], font)];
  }

  console.log('GENERATING SVG');
  const svg = getTextAsSvg(lines, font);

  console.log('COMPRESSING THE SVG');
  const optimizedSvg: any = optimizeSvg(svg);
  writeFile(optimizedSvg);

  console.log('DONE');
};

init();
