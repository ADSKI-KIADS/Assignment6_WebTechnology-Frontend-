
var ICONS = {
  phone:   '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10.5 18.5h3"/></svg>',
  glasses: '<svg viewBox="0 0 24 24"><circle cx="6.5" cy="14" r="3.6"/><circle cx="17.5" cy="14" r="3.6"/><path d="M10.1 13.5q1.9-1.4 3.8 0M2.8 13.5L4 8.5M21.2 13.5L20 8.5"/></svg>',
  bag:     '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12.5H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  cup:     '<svg viewBox="0 0 24 24"><path d="M4.5 10h12v3.5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M16.5 11.5h1.8a2.3 2.3 0 0 1 0 4.6h-2M8 3.5v2.5M12.5 3.5v2.5"/></svg>',
  crumbs:  '<svg viewBox="0 0 24 24"><path d="M3.5 18.5h14L13.5 8.5h-6zM8 13.5h5"/><circle cx="20" cy="13" r=".6"/><circle cx="21" cy="17" r=".6"/><circle cx="19.5" cy="20.5" r=".6"/></svg>'
};
var CAP = '<svg viewBox="0 0 24 24"><path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.8v4.2c0 1.4 2.5 2.7 5.5 2.7s5.5-1.3 5.5-2.7v-4.2"/></svg>';
var THING_WORDS = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup' };

function minutes(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }

function initialsAvatar(name) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ecf0f4"/>' +
    '<text x="50" y="64" font-size="44" text-anchor="middle" font-family="sans-serif" fill="#4a2e20">' + name.charAt(0) + '</text></svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

var LOCAL_AVATARS = ['Aigerim','Aliya','Madina','Ivan','Arman','Sophia','Dias','Bekzat','Aruzhan','Saule','Nurlan','Emma','Timur','Sergey','Yerlan','Kamila','Daniel','Zarina','Natasha','Askar','Inkar'];
function avatarUrl(name) {
  return LOCAL_AVATARS.indexOf(name) >= 0 ? 'img/avatars/' + name + '.png'
    : 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + encodeURIComponent(name);
}

function guestCard(g) {
  var $card = $('<div>')
    .addClass('guest')
    .addClass(g.color)
    .addClass(g.aitu ? 'aitu' : 'not-aitu')
    .attr({ 'data-name': g.name, 'data-time': g.time, 'data-minutes': minutes(g.time), 'data-color': g.color });
  $.each(g.things, function (i, t) { $card.addClass(t); });

  var $ring = $('<div class="ring">').appendTo($card);
  $('<img class="avatar" alt="">')
    .attr('src', avatarUrl(g.name))
    .on('error', function () { $(this).off('error').attr('src', initialsAvatar(g.name)); })
    .appendTo($ring);
  if (g.aitu) $('<span class="badge" title="AITU student">').html(CAP).appendTo($ring);

  $('<div class="name">').text(g.name).appendTo($card);
  $('<div class="time">').text(g.time).appendTo($card);
  var $things = $('<div class="things">').appendTo($card);
  $.each(g.things, function (i, t) { $('<span class="thing">').addClass('t-' + t).attr('title', t).html(ICONS[t]).appendTo($things); });
  return $card;
}

function buildParty(party) {
  var $house = $('#house').empty();
  $.each([2, 1], function (i, floor) {
    var $floor = $('<div class="floor">').attr('data-floor', floor).appendTo($house);
    $('<div class="floor-label">').text('FLOOR ' + floor).appendTo($floor);
    var $rooms = $('<div class="rooms">').appendTo($floor);
    $.each(party, function (j, room) {
      if (room.floor !== floor) return;
      var $room = $('<div class="room">').attr({ id: 'room-' + room.id, 'data-room': room.id, 'data-floor': room.floor }).appendTo($rooms);
      var $head = $('<div class="room-head">').appendTo($room);
      $('<h2 class="room-title">').text(room.name).appendTo($head);
      $('<button type="button" class="sort-btn">').attr('data-room', room.id).text('Sort by time').appendTo($head);
      var $guests = $('<div class="guests">').appendTo($room);
      $.each(room.guests, function (k, g) { guestCard(g).appendTo($guests); });
    });
  });
}
var CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';

function buildLegend() {
  var $l = $('#legend').empty();
  var $c = $('<div class="lg-item">').appendTo($l);
  $.each(['#d64550', '#3b72d6', '#2d9166', '#272c33', '#e3a420', '#8c54c4'], function (i, col) {
    $('<span class="lg-dot">').css('background', col).appendTo($c);
  });
  $c.append(document.createTextNode('Clothing color'));
  $('<div class="lg-sep">').appendTo($l);
  $.each([['phone', 'Phone'], ['glasses', 'Glasses'], ['bag', 'Bag'], ['cup', 'Cup'], ['crumbs', 'Cake crumbs']], function (i, t) {
    $('<div class="lg-item">').append($('<span class="thing">').html(ICONS[t[0]]), document.createTextNode(t[1])).appendTo($l);
  });
  $('<div class="lg-sep">').appendTo($l);
  $('<div class="lg-item">').append($('<span class="thing">').html(CLOCK), document.createTextNode('Arrival time')).appendTo($l);
  $('<div class="lg-item">').append($('<span class="badge lg-badge">').html(CAP), document.createTextNode('AITU student')).appendTo($l);
}
