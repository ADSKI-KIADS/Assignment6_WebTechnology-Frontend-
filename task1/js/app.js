function jump($els) {
  $els.stop(true, true).animate({ top: -14 }, 150).animate({ top: 0 }, 150);
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

function runCase(n) {
  var c = CASES[n];
  $('#house *').stop(true);
  buildParty(PARTY);
  $('.case-btn').removeClass('active').filter('[data-case="' + n + '"]').addClass('active');
  var $found = c.run();
  $found.addClass('found');
  if (!c.self) jump($found);
  showResult(n, $found);
}

$(function () {
  buildParty(PARTY);
  var $grid = $('.case-grid');
  $.each(CASES, function (n, c) {
    if (!c) return;
    $('<button type="button" class="case-btn">').attr('data-case', n)
      .html('<b>' + n + '</b>' + c.title.replace(/\(.*\)/, '').replace(/&/g, '&amp;')).attr('title', c.title)
      .appendTo($grid);
  });
  $('#cases').on('click', '.case-btn', function () { runCase(+$(this).data('case')); });
  $('#reset').on('click', function () { $('#house *').stop(true); buildParty(PARTY); $('.case-btn').removeClass('active'); $('#result').empty(); });
})
buildLegend();
