export const DEPTH_LAYERS = {
    BACKGROUND: 1,

    ENTITIES: {
      UNDER: 7,
      SLIME: {
        UNDER: 8,
        DEFAULT: 9,
        OVER: 10,
      },
      // Персонаж по умолчанию всегда находится выше слоем чем слаймы
      CHARACTER: {
        UNDER: 11,
        DEFAULT: 12,
        OVER: 13
      },
      OVER: 20
    },
  
    OVERLAY: 50,
} as const;