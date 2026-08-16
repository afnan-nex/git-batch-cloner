const { app, BrowserWindow, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico').default;

app.whenReady().then(async () => {
  try {
    const svgPath = path.join(__dirname, 'assets', 'icons', 'Git Cloner.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    const win = new BrowserWindow({
      width: 512,
      height: 512,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        offscreen: true
      }
    });

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;width:512px;height:512px;display:flex;align-items:center;justify-content:center;">${svgContent.replace('<svg ', '<svg style="width:512px;height:512px;" ')}</body></html>`;
    
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    await new Promise(r => setTimeout(r, 600));

    const fullImage = await win.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });

    const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
    const pngPathsForIco = [];

    for (const s of sizes) {
      const resized = fullImage.resize({ width: s, height: s, quality: 'best' });
      const outPath = path.join(__dirname, 'assets', 'icons', `icon_${s}.png`);
      fs.writeFileSync(outPath, resized.toPNG());
      if ([16, 24, 32, 48, 64, 128, 256].includes(s)) {
        pngPathsForIco.push(outPath);
      }
    }

    const appPng = path.join(__dirname, 'assets', 'icons', 'app.png');
    fs.writeFileSync(appPng, fullImage.resize({ width: 256, height: 256, quality: 'best' }).toPNG());

    // Generate .ico
    const icoBuf = await pngToIco(pngPathsForIco);
    fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'app.ico'), icoBuf);
    fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'tray.ico'), icoBuf);

    fs.writeFileSync(path.join(__dirname, 'log.txt'), 'SUCCESS: All PNGs and ICO files rendered from Git Cloner.svg');
    console.log('SUCCESS: All PNGs and ICO files rendered from Git Cloner.svg');
  } catch (err) {
    fs.writeFileSync(path.join(__dirname, 'log.txt'), 'ERROR: ' + err.stack);
    console.error('ERROR in icon generation:', err);
  } finally {
    app.quit();
  }
});
