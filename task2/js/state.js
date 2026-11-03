var state;
function resetState() {
  state = JSON.parse(JSON.stringify(PARTY));
  $.each(state, function (i, room) { $.each(room.guests, function (k, g) { g.seq = k; }); }); 
}
function roomById(id) { return $.grep(state, function (r) { return r.id === id; })[0]; }
function findGuest(name) {
  for (var i = 0; i < state.length; i++) {
    for (var k = 0; k < state[i].guests.length; k++) {
      if (state[i].guests[k].name === name) return { room: state[i], index: k, guest: state[i].guests[k] };
    }
  }
  return null;
}
