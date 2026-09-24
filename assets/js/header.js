(function () {
  var trigger = document.getElementById('profileTrigger');
  var card = document.getElementById('profileCard');
  if (!trigger || !card) return;

  function closeCard() {
    card.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleCard() {
    var isOpen = !card.hidden;
    if (isOpen) {
      closeCard();
    } else {
      card.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleCard();
  });

  document.addEventListener('click', function (e) {
    if (!card.hidden && !card.contains(e.target) && e.target !== trigger) {
      closeCard();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCard();
  });
})();
