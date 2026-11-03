var CASES = [
  null,
  { title: 'Who is in the hall?', kind: 'guests',
    code: "$('#room-hall .guest')",
    run: function () { return $('#room-hall .guest'); } },

  { title: 'Who is dressed in yellow or purple?', kind: 'guests',
    code: "$('.guest.yellow, .guest.purple')",
    run: function () { return $('.guest.yellow, .guest.purple'); } },

  { title: 'Which AITU students are upstairs?', kind: 'guests',
    code: "$('.floor[data-floor=\"2\"] .guest.aitu')",
    run: function () { return $('.floor[data-floor="2"] .guest.aitu'); } },

  { title: 'Who has glasses or a bag?', kind: 'guests',
    code: "$('.guest.glasses, .guest.bag')",
    run: function () { return $('.guest.glasses, .guest.bag'); } },

  { title: 'Who came with nothing at all?', kind: 'guests',
    code: "$('.guest:not(.phone):not(.glasses):not(.bag):not(.cup):not(.crumbs)')",
    run: function () { return $('.guest:not(.phone):not(.glasses):not(.bag):not(.cup):not(.crumbs)'); } },

  { title: 'Who has a phone but no bag?', kind: 'guests',
    code: "$('.guest.phone:not(.bag)')",
    run: function () { return $('.guest.phone:not(.bag)'); } },

  { title: 'Who arrived between 20:30 and 21:00, both times included?', kind: 'guests',
    code: "$('.guest').filter(function () {\n  var m = $(this).data('minutes');   // 20:30 = 1230, 21:00 = 1260\n  return m >= 1230 && m <= 1260;\n})",
    run: function () { return $('.guest').filter(function () { var m = $(this).data('minutes'); return m >= 1230 && m <= 1260; }); } },

  { title: 'Who arrived after 21:00 and is not an AITU student?', kind: 'guests',
    code: "$('.guest.not-aitu').filter(function () {\n  return $(this).data('minutes') > 1260;   // after 21:00\n})",
    run: function () { return $('.guest.not-aitu').filter(function () { return $(this).data('minutes') > 1260; }); } },

  { title: 'Who stands right next to Askar?', kind: 'guests',
    code: "$('.guest[data-name=\"Askar\"]').prev().add($('.guest[data-name=\"Askar\"]').next())",
    run: function () { var $a = $('.guest[data-name="Askar"]'); return $a.prev().add($a.next()); } },

  { title: 'Who stands last in each room?', kind: 'guests',
    code: "$('.guests .guest:last-child')",
    run: function () { return $('.guests .guest:last-child'); } },

  { title: 'Who stands third in each room?', kind: 'guests',
    code: "$('.guests .guest:nth-child(3)')",
    run: function () { return $('.guests .guest:nth-child(3)'); } },

  { title: 'Who stands after Timur in his room?', kind: 'guests',
    code: "$('.guest[data-name=\"Timur\"]').nextAll()",
    run: function () { return $('.guest[data-name="Timur"]').nextAll(); } },

  { title: 'Who stands right before someone in black?', kind: 'guests',
    code: "$('.guest.black').prev()",
    run: function () { return $('.guest.black').prev(); } },

  { title: 'In which room is Aruzhan?', kind: 'rooms',
    code: "$('.guest[data-name=\"Aruzhan\"]').closest('.room')",
    run: function () { return $('.guest[data-name="Aruzhan"]').closest('.room'); } },

  { title: 'Which rooms have fewer than 6 guests?', kind: 'rooms',
    code: "$('.room:not(:has(.guest:nth-child(6)))')",
    run: function () { return $('.room:not(:has(.guest:nth-child(6)))'); } },

  { title: 'In which rooms does somebody have a cup, but nobody wears glasses?', kind: 'rooms',
    code: "$('.room:has(.guest.cup):not(:has(.guest.glasses))')",
    run: function () { return $('.room:has(.guest.cup):not(:has(.guest.glasses))'); } },

  { title: 'Who came first to each room?', kind: 'guests',
    code: "$('.room').map(function () {\n  return $(this).find('.guest').toArray().sort(function (a, b) {\n    return $(a).data('minutes') - $(b).data('minutes');\n  })[0];\n})",
    run: function () {
      return $('.room').map(function () {
        return $(this).find('.guest').toArray().sort(function (a, b) { return $(a).data('minutes') - $(b).data('minutes'); })[0];
      });
    } },

  { title: 'Miras (AITU, blue, 21:20, phone) joins Askar and Inkar and stands between them', kind: 'guests', self: true,
    code: "$('<div class=\"guest blue aitu phone\" data-name=\"Miras\" data-time=\"21:20\" data-minutes=\"1280\">…</div>')\n  .hide()\n  .insertAfter('.guest[data-name=\"Askar\"]')\n  .fadeIn(700)\n  .animate({ top: -14 }, 150).animate({ top: 0 }, 150)",
    run: function () {
      return guestCard({ name: 'Miras', color: 'blue', time: '21:20', aitu: true, things: ['phone'] })
        .hide()
        .insertAfter('.guest[data-name="Askar"]')
        .addClass('found')
        .fadeIn(700)
        .animate({ top: -14 }, 150).animate({ top: 0 }, 150);
    } },

  { title: 'Natasha goes home: her card fades away and is removed', kind: 'guests', self: true,
    code: "$('.guest[data-name=\"Natasha\"]')\n  .animate({ top: -14 }, 150).animate({ top: 0 }, 150)\n  .fadeOut(700, function () { $(this).remove(); })",
    run: function () {
      return $('.guest[data-name="Natasha"]')
        .addClass('found')
        .animate({ top: -14 }, 150).animate({ top: 0 }, 150)
        .fadeOut(700, function () { $(this).remove(); });
    } },

  { title: 'Who took the cake? (downstairs, came after 21:00 but before 21:30, has crumbs, no cup, next to an AITU student)', kind: 'guests',
    code: "$('.floor[data-floor=\"1\"] .guest.crumbs:not(.cup)')\n  .filter(function () {\n    var m = $(this).data('minutes');   // 21:00 = 1260, 21:30 = 1290\n    return m > 1260 && m < 1290;\n  })\n  .filter(function () {\n    return $(this).prev('.aitu').add($(this).next('.aitu')).length > 0;\n  })",
    run: function () {
      return $('.floor[data-floor="1"] .guest.crumbs:not(.cup)')
        .filter(function () { var m = $(this).data('minutes'); return m > 1260 && m < 1290; })
        .filter(function () { return $(this).prev('.aitu').add($(this).next('.aitu')).length > 0; });
    } }
];
