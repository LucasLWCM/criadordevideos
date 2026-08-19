import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("swangle");
Config.setConcurrency(2);
// Assets servidos de assets/ — staticFile("imagens/foo.jpg") resolve assets/imagens/foo.jpg
Config.setPublicDir("assets");
