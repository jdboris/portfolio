const path = require("path");
const fs = require("fs");

module.exports = async function (source) {
  const loaderContext = this;
  const manifest = JSON.parse(source);

  return JSON.stringify({
    ...manifest,
    icons: await Promise.all(
      manifest.icons.map(async (icon) => {
        const inputPath = await new Promise((resolve) =>
          loaderContext.resolve(this.context, icon.src, (err, result) =>
            resolve(result)
          )
        );

        const outputPath = `/assets/${
          path.parse(inputPath).name
        }.${require("crypto")
          .createHash("md5")
          .update(fs.readFileSync(inputPath))
          .digest("hex")}${path.parse(inputPath).ext}`;

        loaderContext.emitFile(outputPath, fs.readFileSync(inputPath));

        return {
          ...icon,
          src: outputPath,
        };
      })
    ),
  });
};
