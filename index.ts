import opentype from 'opentype.js';
import { writeSvg } from './src/utils/write-svg';

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

const copy = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`;

const getWords = (sentence: string) => {
  return sentence.split(' ');
};

const SVG_INNERT_TOP_MARGIN = 3; // 3px - not accurate
const PX_TO_PT_MULTIPLICATOR = 1.33;

// props
const maxWidth = 300;
const fontSize = 15;
const tracking = 0;
const lineSpacing = 5;
const kerning = false;

const init = () => {
  const font = opentype.loadSync('./fonts/Roboto-Regular.ttf');
  const words = getWords(copy);

  let lines = [];
  let line: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const tmpLine = `${line.join(' ')} ${words[i]}`;

    // using advancedWidth as it includes the white space aroudn the word/glyph (ascent and descent)
    const advancedWidth = font.getAdvanceWidth(tmpLine, fontSize, {
      kerning,
      tracking,
    });

    if (words[i + 1] === undefined) {
      line.push(words[i]);
    }

    if (words[i + 1] === undefined || advancedWidth > maxWidth) {
      lines.push(line.join(' '));
      line = [words[i]];
    } else {
      line.push(words[i]);
    }
  }

  // generate paths
  const paths = lines.map((line, index) => {
    const fontSizeInPt = fontSize * PX_TO_PT_MULTIPLICATOR;
    const lineHeightInPt = lineSpacing * PX_TO_PT_MULTIPLICATOR;

    const yPos =
      (fontSizeInPt + lineHeightInPt) * (index + 1) - SVG_INNERT_TOP_MARGIN; // cheating here, not be as per the spcification rules

    const path = font.getPath(line, 0, yPos, fontSize, {
      kerning,
      tracking,
    });

    return { svg: path.toSVG(1), path };
  });

  const height = paths[paths.length - 1].path.getBoundingBox().y2;

  writeSvg(
    paths.map((item) => item.svg),
    copy,
    fontSize,
    height,
    lineSpacing
  );
};

init();
