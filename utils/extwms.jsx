/* @preserve
 * Leaflet 1.5.1+Detached: 2e3e0ffbe87f246eb76d86d2633ddd59b262830b.2e3e0ff, a JS library for interactive maps. http://leafletjs.com
 * (c) 2010-2018 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
"use strict";
function callAjax(a, d, c) {
  const b = new XMLHttpRequest();
  b.onreadystatechange = function() {
    if (b.readyState == 4 && b.status == 200) {
      d(b.response);
    }
  };
  b.open("GET", a, true);
  b.responseType = "blob";
  b.setRequestHeader(c[0].header, c[0].value);
  b.send();
}
L.TileLayer.WMSHeader = L.TileLayer.WMS.extend({
  initialize: function(b, a, c) {
    L.TileLayer.WMS.prototype.initialize.call(this, b, a);
    this.headers = c;
  },
  createTile: function(d, a) {
    const c = this.getTileUrl(d);
    const b = document.createElement("img");
    callAjax(
      c,
      function(e) {
        b.src = URL.createObjectURL(e);
        a(null, b);
      },
      this.headers
    );
    return b;
  }
});
L.TileLayer.wmsHeader = function(b, a, c) {
  return new L.TileLayer.WMSHeader(b, a, c);
};
