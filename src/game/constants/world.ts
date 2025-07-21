const WIDTH = 318;
const HEIGHT = 500;
const PADDING = 20;
const SPAWN_BAND_COUNT = 5;
const SPAWN_BAND_WIDTH = WIDTH / 5;
const SPAWN_START_Y = -40;

export const WORLD = {
    WIDTH,
    HEIGHT,
    PADDING,
    SPAWN_BAND_COUNT,
    SPAWN_BAND_WIDTH,
    SPAWN_START_Y
} as const