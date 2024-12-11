const path = require("path");
const { fs, log, util } = require("vortex-api");
const GAME_ID = "coralisland";
const STEAMAPP_ID = "1158160";
const MOD_FILE_EXT = ".pak";

function findGame() {
  return util.GameStoreHelper.findByAppId([STEAMAPP_ID]).then(
    (game) => game.gamePath,
  );
}

function prepareForModding(discovery) {
  return fs.ensureDirAsync(
    path.join(discovery.path, "ProjectCoral", "Content", "Paks", "mods"),
  );
}

function testSupportedContent(files, gameId) {
  let supported =
    gameId === GAME_ID &&
    files.find((file) => path.extname(file).toLowerCase() === MOD_FILE_EXT) !==
      undefined;

  return Promise.resolve({
    supported,
    requiredFiles: [],
  });
}

function installContent(files) {
  const modFile = files.find(
    (file) => path.extname(file).toLowerCase() === MOD_FILE_EXT,
  );
  const idx = modFile.indexOf(path.basename(modFile));
  const rootPath = path.dirname(modFile);

  const filtered = files.filter(
    (file) => file.indexOf(rootPath) !== -1 && !file.endsWith(path.sep),
  );

  const instructions = filtered.map((file) => {
    return {
      type: "copy",
      source: file,
      destination: path.join(file.substr(idx)),
    };
  });

  return Promise.resolve({ instructions });
}

function main(context) {
  context.registerInstaller(
    "coralisland-mod",
    25,
    testSupportedContent,
    installContent,
  );

  context.registerGame({
    id: GAME_ID,
    name: "Coral Island",
    logo: "gameart.png",
    mergeMods: true,
    queryPath: findGame,
    supportedTools: [],
    queryModPath: () => "ProjectCoral/Content/Paks/mods",
    executable: () => "ProjectCoral.exe",
    parameters: ["-fileopenlog"],
    requiredFiles: [
      "ProjectCoral.exe",
      "ProjectCoral/Binaries/Win64/ProjectCoral-Win64-Shipping.exe",
    ],
    setup: prepareForModding,
    environment: {
      SteamAPPId: STEAMAPP_ID,
    },
    details: {
      steamAppId: STEAMAPP_ID,
    },
  });
  return true;
}

module.exports = {
  default: main,
};
