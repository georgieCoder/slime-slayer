module.exports = {
  presets: [
    ['@babel/preset-env', { 
      useBuiltIns: 'entry',
      corejs: 3,
      modules: false
    }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ],
  plugins: [
    process.env.NODE_ENV === 'development' && 'react-refresh/babel'
  ].filter(Boolean)
};