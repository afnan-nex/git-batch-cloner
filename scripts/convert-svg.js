const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const pngToIco = require('png-to-ico').default;

async function main() {
  const svgPath = path.join(__dirname, '..', 'assets', 'icons', 'Git Cloner.svg');
  const svg = fs.readFileSync(svgPath, 'utf8');

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
  const pngPathsForIco = [];

  for (const size of sizes) {
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: size
      }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    const outPath = path.join(__dirname, '..', 'assets', 'icons', `icon_${size}.png`);
    fs.writeFileSync(outPath, pngBuffer);
    console.log(`Rendered icon_${size}.png (${pngBuffer.length} bytes)`);

    if ([16, 24, 32, 48, 64, 128, 256].includes(size)) {
      pngPathsForIco.push(outPath);
    }
  }

  // Also write 256 as app.png
  const resvg256 = new Resvg(svg, { fitTo: { mode: 'width', value: 256 } });
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icons', 'app.png'), resvg256.render().asPng());

  // Generate ICO with multi-resolution frames
  const icoBuf = await pngToIco(pngPathsForIco);
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icons', 'app.ico'), icoBuf);
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icons', 'tray.ico'), icoBuf);
  console.log(`Generated app.ico & tray.ico (${icoBuf.length} bytes)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
