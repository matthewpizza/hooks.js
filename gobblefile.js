var gobble = require( 'gobble' );

module.exports = gobble( 'src' ).map( 'esperanto', {
  type     : 'umd',
  name     : 'Hooks',
  sourceMap: false
} );