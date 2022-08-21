import { writeFileSync } from 'fs';
import { optimize } from 'svgo';

export const writeSvg = (
  paths: string[],
  copy: string,
  fontSize: number,
  height: number,
  lineSpacing: number = 0
) => {
  const finalSvg = `<svg height="${height + 1}">${paths.join(' ')}</svg>`;
  const optimizedSvg: any = optimize(finalSvg);

  writeFileSync(
    './output/text-opentype.html',
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
          font-family: Roboto;
          src: url('../fonts/Roboto-Regular.ttf');
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
          font-family: Roboto;
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
          font-family: Roboto;
          letter-spacing: normal;
          font-size: ${fontSize}px;
          line-height: ${lineSpacing + fontSize}pt;
          margin-bottom: 50px;

        }

        svg {
          margin-bottom: 30px;
        }
      </style>
      <div>
        <h1>Copy</h1>
        <p>${copy}</p>
        
        <h1>Svg</h1>
        ${finalSvg}
        
        <h1>Optimised Svg</h1>
        ${optimizedSvg.data}
      </div>
    </body>
  </html>
`
  );

  writeFileSync('./output/test.svg', optimizedSvg.data);
};
