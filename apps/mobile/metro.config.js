// Expo SDK 52+ auto-configura o Metro para monorepos (watchFolders/nodeModulesPaths),
// então não precisamos configurar isso manualmente aqui — só envolvemos com NativeWind.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
