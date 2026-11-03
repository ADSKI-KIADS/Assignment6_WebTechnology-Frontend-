
var DUR = 800;
var flights = [];
var dirty = false;

function guestEl(name) { return $('.guest[data-name="' + name + '"]'); }
function cleanPage() { if (dirty) { render(); } }

function abortAll() {
  closeCardNow();
  $.each(flights, function (i, f) { f.prog.stop(true); f.$fly.stop(true).remove(); });
  flights = [];
  $('.fly').remove();
  $('#house *').stop(true);
}
function render() { abortAll(); buildParty(state); dirty = false; }

var CARD_W = 340, CARD_AV = 80, CARD_MS = 320;
var card = { $el: null, $img: null, $body: null, name: null, st: 'closed' };
var pendingName = null;

function joinWords(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

function avatarRect(name) {
  var $a = guestEl(name).find('.avatar');
  if (!$a.length) return null;
  var o = $a.offset();
  return { left: o.left, top: o.top, size: $a.outerWidth() };
}

function fillCard($body, loc) {
  var g = loc.guest, items = $.grep(g.things, function (t) { return t !== 'crumbs'; });
  var $head = $('<div class="card-head">').appendTo($body);
  $('<h3>').text(g.name).appendTo($head);
  $('<div class="where">').text('Now in the ' + loc.room.name.toLowerCase() + ', floor ' + loc.room.floor).appendTo($head);
  var $ul = $('<ul>').appendTo($body);
  $('<li>').text('Came at ' + g.time).appendTo($ul);
  $('<li>').text(g.aitu ? 'AITU student' : 'Not an AITU student').appendTo($ul);
  $('<li>').html('<span class="swatch" style="background:' + g.color + '"></span>').append(document.createTextNode('Wears ' + g.color + ' clothes')).appendTo($ul);
  $('<li>').text(items.length ? 'Has ' + joinWords($.map(items, function (t) { return THING_WORDS[t]; })) : 'Came with nothing').appendTo($ul);
  if (g.things.indexOf('crumbs') >= 0) $('<li>').text('Has cake crumbs on the clothes').appendTo($ul);
  var $moves = $('<div class="moves">').appendTo($body);
  $.each(state, function (i, r) {
    if (r.id === loc.room.id) return;
    $('<button type="button" class="move-btn">').attr({ 'data-to': r.id, 'data-name': g.name }).text('Move to the ' + r.name.toLowerCase()).appendTo($moves);
  });
}

function openCard(name) {
  var $g = guestEl(name), loc = findGuest(name), rect = avatarRect(name);
  if (!$g.length || !loc || !rect || $g.hasClass('moving')) return;
  var $card = $('<div id="card">').appendTo('body');
  var $img = $('<img class="card-avatar" alt="">').attr('src', $g.find('.avatar').attr('src')).appendTo($card);
  var $body = $('<div class="card-body">').appendTo($card);
  fillCard($body, loc);

  $card.css({ left: 0, top: 0, width: CARD_W, height: 'auto', visibility: 'hidden' });
  var H = $card.outerHeight();
  var $w = $(window);
  var left = Math.max($w.scrollLeft() + 8, Math.min(rect.left + rect.size / 2 - CARD_W / 2, $w.scrollLeft() + $w.width() - CARD_W - 8));
  var top = Math.max($w.scrollTop() + 8, Math.min(rect.top - 14, $w.scrollTop() + $w.height() - H - 8));
  $card.css({ visibility: 'visible', left: rect.left, top: rect.top, width: rect.size, height: rect.size, borderRadius: rect.size / 2 });
  $img.css({ left: 0, top: 0, width: rect.size, height: rect.size });
  $body.css({ opacity: 0 });

  card = { $el: $card, $img: $img, $body: $body, name: name, st: 'opening' };
  $card.animate({ left: left, top: top, width: CARD_W, height: H, borderRadius: 16 }, CARD_MS, function () { card.st = 'open'; });
  $img.animate({ left: 14, top: 14, width: CARD_AV, height: CARD_AV }, CARD_MS);
  $body.delay(CARD_MS / 2).animate({ opacity: 1 }, CARD_MS / 2);
}

function closeCard() {
  if (card.st !== 'open' && card.st !== 'opening') return;
  var c = card, rect = avatarRect(c.name);
  c.st = 'closing';
  c.$el.stop(true); c.$img.stop(true); c.$body.stop(true).animate({ opacity: 0 }, 100);
  if (!rect) { finishClose(c); return; }
  c.$img.animate({ left: 0, top: 0, width: rect.size, height: rect.size }, CARD_MS);
  c.$el.animate({ left: rect.left, top: rect.top, width: rect.size, height: rect.size, borderRadius: rect.size / 2 }, CARD_MS, function () { finishClose(c); });
}
function finishClose(c) {
  c.$el.remove();
  card = { $el: null, $img: null, $body: null, name: null, st: 'closed' };
  if (pendingName) { var n = pendingName; pendingName = null; openCard(n); }
}
function closeCardNow() {
  if (card.$el) card.$el.stop(true).find('*').stop(true).end().remove();
  card = { $el: null, $img: null, $body: null, name: null, st: 'closed' };
  pendingName = null;
}

function guestClicked(name) {
  if (card.st === 'closed') openCard(name);
  else if (card.st === 'closing') pendingName = name;
  else if (card.name === name) { pendingName = null; closeCard(); }
  else { pendingName = name; closeCard(); }
}

function moveGuest(name, toId) {
  var loc = findGuest(name);
  if (!loc || loc.room.id === toId) return;
  var $g = guestEl(name);
  if (!$g.length || $g.hasClass('moving')) return;
  closeCardNow();

  var to = roomById(toId);
  loc.room.guests.splice(loc.index, 1);
  loc.guest.seq = Math.max.apply(null, $.map(to.guests, function (g) { return g.seq; }).concat(-1)) + 1;
  to.guests.push(loc.guest);

  var w = $g.outerWidth(), h = $g.outerHeight(), start = $g.offset();
  var $fly = $g.clone().removeClass('found').addClass('fly').css({ position: 'absolute', left: start.left, top: start.top, margin: 0, width: w, zIndex: 3000 }).appendTo('body');

  var $gap = $('<div class="gap">').css({ width: w, height: h }).insertBefore($g);
  $gap.animate({ width: 0, marginRight: 0 }, DUR, function () { $(this).remove(); });

  var $guests = $('#room-' + toId + ' .guests');
  $g.removeClass('found').addClass('moving').css({ width: 0, marginRight: 0, left: 0, top: 0, visibility: 'hidden', overflow: 'hidden' }).appendTo($guests);

  var rowTop0 = $g.offset().top;
  $g.css({ width: w, marginRight: 8 });
  var fin = $g.offset(), g0 = $guests.offset();
  $g.css({ width: 0, marginRight: 0 });
  var wraps = Math.abs(fin.top - rowTop0) > 2;

  var left = 2;
  function done() {
    if (--left) return;
    $fly.remove();
    flights = $.grep(flights, function (f) { return f.$fly[0] !== $fly[0]; });
    $g.css({ width: '', marginRight: '', overflow: '', visibility: '' }).removeClass('moving');
  }
  $g.animate({ width: w, marginRight: 8 }, { duration: DUR, queue: 'open', complete: done }).dequeue('open');

  var prog = $({ p: 0 });
  flights.push({ prog: prog, $fly: $fly });
  prog.animate({ p: 1 }, {
    duration: DUR, easing: 'swing', complete: done,
    step: function (p) {
      var t = $g.offset();
      if (wraps) { var g1 = $guests.offset(); t = { left: fin.left + g1.left - g0.left, top: fin.top + g1.top - g0.top }; }
      $fly.css({ left: start.left + (t.left - start.left) * p, top: start.top + (t.top - start.top) * p });
    }
  });
}

function sortRoom(roomId) {
  var room = roomById(roomId);
  closeCardNow();
  var byTime = room.guests.slice().sort(function (a, b) { return minutes(a.time) - minutes(b.time); });
  var isSorted = $.grep(room.guests, function (g, i) { return g !== byTime[i]; }).length === 0;
  room.guests = isSorted ? room.guests.slice().sort(function (a, b) { return a.seq - b.seq; }) : byTime;

  var $guests = $('#room-' + roomId + ' .guests');
  var $els = $guests.children('.guest').stop('move', true);
  var first = {};
  $els.each(function () { first[$(this).data('name')] = $(this).offset(); });
  $els.css({ left: 0, top: 0 });
  $.each(room.guests, function (i, g) { $guests.append($guests.children('.guest[data-name="' + g.name + '"]')); });
  $els.each(function () {
    var $e = $(this), a = first[$e.data('name')], b = $e.offset();
    $e.css({ left: a.left - b.left, top: a.top - b.top })
      .animate({ left: 0, top: 0 }, { duration: DUR * 0.75, queue: 'move' }).dequeue('move');
  });
}

$(function () {
  $('#house').on('click', '.guest', function () {
    var name = $(this).data('name');
    cleanPage();
    if (guestEl(name).length) guestClicked(name);
  });
  $('#house').on('click', '.sort-btn', function () { cleanPage(); sortRoom($(this).data('room')); });
  $(document).on('click', '#card .move-btn', function () { moveGuest($(this).data('name'), $(this).data('to')); });
  $(document).on('click', function (e) {
    if ($(e.target).closest('#card, .guest').length) return;
    pendingName = null; closeCard();
  });
  $(document).on('keydown', function (e) { if (e.key === 'Escape' || e.keyCode === 27) { pendingName = null; closeCard(); } });
});
