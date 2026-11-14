// Sin zoom en la web y en el admin: pellizco, doble toque, Ctrl + rueda / trackpad y Ctrl/Cmd + "+" "−" "0".
// (El CSS "touch-action" ya frena el pellizco y el doble toque; esto cubre a Safari de iPhone y a la compu.)
;(function () {
  var stop = function (e) {
    e.preventDefault()
  }
  // Safari (iPhone / iPad): gestos de pellizco
  document.addEventListener('gesturestart', stop, { passive: false })
  document.addEventListener('gesturechange', stop, { passive: false })
  // dos dedos moviéndose = pellizco
  document.addEventListener(
    'touchmove',
    function (e) {
      if (e.touches.length > 1) e.preventDefault()
    },
    { passive: false },
  )
  // compu: Ctrl + rueda y pellizco del trackpad (llega como rueda con Ctrl)
  window.addEventListener(
    'wheel',
    function (e) {
      if (e.ctrlKey) e.preventDefault()
    },
    { passive: false },
  )
  // compu: Ctrl/Cmd + "+", "−", "0"
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && ['+', '=', '-', '_', '0'].indexOf(e.key) !== -1) e.preventDefault()
  })
})()
