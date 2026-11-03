function jump($els) {
  $els.stop('move', true, true)
    .animate({ top: -14 }, { duration: 150, queue: 'move' })
    .animate({ top: 0 }, { duration: 150, queue: 'move' })
    .dequeue('move');
}

function showResult(n, $found) {
  var c = CASES[n];
  var names = $found.map(function () {
    var $e = $(this);
    return $e.hasClass('room') ? $e.find('.room-title').text() : $e.data('name');
  }).get();
  var $r = $('#result').empty();
  $('<div class="q">').text('Case ' + n + '. ' + c.title).appendTo($r);
  $('<div>').append(
    document.createTextNode(c.kind === 'rooms' ? 'Rooms found:' : 'Found:'),
    $('<span class="count">').text($found.length),
    document.createTextNode(names.join(', '))
  ).appendTo($r);
}

function spotlight($found, kind) {
  var $bright = kind === 'rooms' ? $found.find('.guest') : $found;
  $('.guest').not($bright).stop('fx', true).fadeTo(300, 0.2);
}

function clearSpotlight() {
  $('.guest').stop('fx', true, true).fadeTo(300, 1);
  $('.found').removeClass('found');
  $('.case-btn').removeClass('active');
  $('#result').empty();
}

function runCase(n) {
  var c = CASES[n];
  render();
  $('.case-btn').removeClass('active').filter('[data-case="' + n + '"]').addClass('active');
  var $found = c.run();
  $found.addClass('found');
  if (!c.self) jump($found);
  if (n !== 19) spotlight($found, c.kind);
  dirty = (n === 18 || n === 19);
  showResult(n, $found);
}

$(function () {
  resetState();
  buildParty(state);
  var $grid = $('.case-grid');
  $.each(CASES, function (n, c) {
    if (!c) return;
    $('<button type="button" class="case-btn">').attr('data-case', n)
      .html('<b>' + n + '</b>' + c.title.replace(/\(.*\)/, '')).attr('title', c.title).appendTo($grid);
  });
  $('#cases').on('click', '.case-btn', function () { runCase(+$(this).data('case')); });
  $('#clear').on('click', clearSpotlight);
  $('#reset').on('click', function () { resetState(); render(); $('.case-btn').removeClass('active'); $('#result').empty(); });
})
buildLegend();
